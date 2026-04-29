#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { Command } from 'commander'
import inquirer from 'inquirer'
import chalk from 'chalk'
import { glob } from 'glob'

const program = new Command()
const DICT_DIR = path.resolve(process.cwd(), 'dictionaries')

// Utility to get all dictionary files
const getDictFiles = () => {
  // Use forward slashes for glob and normalize path
  const pattern = path.join(DICT_DIR, '*.json').replace(/\\/g, '/')
  return glob.sync(pattern)
}

// Utility to read a JSON file
const readJson = file => {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

// Utility to write a JSON file
const writeJson = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

// Utility to set value at path (e.g. "data_table.next_button")
const setPath = (obj, pathStr, value) => {
  const keys = pathStr.split('.')
  let current = obj
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {}
    current = current[keys[i]]
  }
  current[keys[keys.length - 1]] = value
}

// Utility to get value at path
const getPath = (obj, pathStr) => {
  const keys = pathStr.split('.')
  let current = obj
  for (const key of keys) {
    if (current[key] === undefined) return undefined
    current = current[key]
  }
  return current
}

// Utility to delete value at path
const deletePath = (obj, pathStr) => {
  const keys = pathStr.split('.')
  let current = obj
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) return
    current = current[keys[i]]
  }
  delete current[keys[keys.length - 1]]
}

// Interactive creation of variables
const promptForVariables = async variableList => {
  const result = {}
  // Filter out empty strings from the list
  const cleanList = variableList.map(v => v.trim()).filter(v => v.length > 0)

  for (const trimmed of cleanList) {
    if (trimmed.endsWith('{}') || trimmed.includes('{')) {
      // Handle nesting like "form{a,b}" or "obj{}"
      const match = trimmed.match(/^([^{}]+)\{(.*)\}$|^([^{}]+)\{\}$/)
      if (match) {
        const nestedKey = (match[1] || match[3]).trim()
        const innerContent = match[2] || ''
        console.log(chalk.blue(`\nDefining nested object: ${nestedKey}`))

        let subVars = []
        if (innerContent) {
          subVars = innerContent.split(',')
        } else {
          const subVarsInput = await inquirer.prompt([
            {
              type: 'input',
              name: 'subVars',
              message: `Enter sub-variables for ${nestedKey} (comma separated, use {} for nesting):`,
            },
          ])
          subVars = subVarsInput.subVars.split(',')
        }
        result[nestedKey] = await promptForVariables(subVars)
      } else {
        // Fallback for simple "key{}" if regex fails
        const nestedKey = trimmed.replace('{}', '').trim()
        console.log(chalk.blue(`\nDefining nested object: ${nestedKey}`))
        const subVarsInput = await inquirer.prompt([
          {
            type: 'input',
            name: 'subVars',
            message: `Enter sub-variables for ${nestedKey} (comma separated, use {} for nesting):`,
          },
        ])
        result[nestedKey] = await promptForVariables(subVarsInput.subVars.split(','))
      }
    } else {
      result[trimmed] = '' // Leaf node
    }
  }
  return result
}

// Interactive translation for a structure
const translateStructure = async (structure, parentPath = '') => {
  const dictFiles = getDictFiles()
  const translations = {}

  // Initialize translations for each language
  for (const file of dictFiles) {
    const lang = path.basename(file, '.json')
    translations[lang] = translations[lang] || {}
  }

  const keys = Object.keys(structure)
  for (const key of keys) {
    const currentPath = parentPath ? `${parentPath}.${key}` : key
    if (typeof structure[key] === 'object' && structure[key] !== null) {
      const subTranslations = await translateStructure(structure[key], currentPath)
      for (const lang in translations) {
        translations[lang][key] = subTranslations[lang]
      }
    } else {
      console.log(chalk.yellow(`\nTranslating: ${chalk.bold(currentPath)}`))
      for (const lang in translations) {
        const answer = await inquirer.prompt([
          {
            type: 'input',
            name: 'value',
            message: `${lang}:`,
          },
        ])
        translations[lang][key] = answer.value
      }
    }
  }
  return translations
}

program.name('lang-manager').description('Manage dictionary translation files').version('1.0.0')

// CREATE command
program
  .command('create <path>')
  .option('--table', 'Use data table template')
  .option('--notifications', 'Use notifications template')
  .action(async (targetPath, options) => {
    const dictFiles = getDictFiles()
    if (dictFiles.length === 0) {
      console.error(chalk.red('No dictionary files found in /dictionaries'))
      process.exit(1)
    }

    // Check if path already exists in first file
    const firstDict = readJson(dictFiles[0])
    if (getPath(firstDict, targetPath)) {
      console.error(chalk.red(`Error: Path "${targetPath}" already exists.`))
      process.exit(1)
    }

    let variableInput = ''
    if (options.table) {
      const { columns } = await inquirer.prompt([
        {
          type: 'input',
          name: 'columns',
          message: 'Enter column names (e.g. name, email, role):',
        },
      ])
      const columnVars = columns
        .split(',')
        .map(c => `column_${c.trim()}`)
        .join(', ')
      variableInput = `${columnVars}, action_copy_key, form{title_label, title_placeholder, title_description, description_label, description_placeholder, description_description, status_label, status_description}`
    } else if (options.notifications) {
      const { includeHttpStatus } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'includeHttpStatus',
          message: 'Include HTTP status overrides (400, 401, 403, 404, 500)?',
          default: false,
        },
      ])
      variableInput = includeHttpStatus
        ? 'success, error, http_status{400, 401, 403, 404, 500}'
        : 'success, error'
    } else {
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'vars',
          message: 'Enter variables separated by comma (use {} for nested objects):',
        },
      ])
      variableInput = answer.vars
    }

    const structure = await promptForVariables(variableInput.split(','))
    const translations = await translateStructure(structure, targetPath)

    for (const file of dictFiles) {
      const lang = path.basename(file, '.json')
      const data = readJson(file)
      setPath(data, targetPath, translations[lang])
      writeJson(file, data)
      console.log(chalk.green(`✓ Updated ${lang}.json`))
    }
  })

// UPDATE command
program.command('update <path>').action(async targetPath => {
  const dictFiles = getDictFiles()
  console.log(chalk.blue(`\nUpdating variable: ${targetPath}`))

  for (const file of dictFiles) {
    const lang = path.basename(file, '.json')
    const data = readJson(file)
    const currentValue = getPath(data, targetPath)

    if (currentValue === undefined) {
      console.warn(
        chalk.yellow(`Warning: Path "${targetPath}" not found in ${lang}.json. Skipping.`),
      )
      continue
    }

    if (typeof currentValue === 'object') {
      console.error(
        chalk.red(`Error: "${targetPath}" is an object. Updates must target specific keys.`),
      )
      process.exit(1)
    }

    console.log(chalk.gray(`${lang} current: "${currentValue}"`))
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'newValue',
        message: `${lang} new:`,
      },
    ])

    setPath(data, targetPath, answer.newValue)
    writeJson(file, data)
  }
  console.log(chalk.green('\n✓ All languages updated successfully.'))
})

// DELETE command
program.command('delete <path>').action(async targetPath => {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to delete "${targetPath}" from ALL dictionary files?`,
      default: false,
    },
  ])

  if (!confirm) return

  const dictFiles = getDictFiles()
  for (const file of dictFiles) {
    const lang = path.basename(file, '.json')
    const data = readJson(file)
    deletePath(data, targetPath)
    writeJson(file, data)
    console.log(chalk.green(`✓ Deleted from ${lang}.json`))
  }
})

program.parse()
