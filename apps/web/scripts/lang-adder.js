#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { Command } from 'commander'

const program = new Command()
const DICT_DIR = path.resolve(process.cwd(), 'dictionaries')
const DICT_TS_PATH = path.resolve(process.cwd(), 'app', '[lang]', 'dictionaries.ts')

// Utility to get all dictionary files
const getDictFiles = () => {
  return fs
    .readdirSync(DICT_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(DICT_DIR, f))
}

// Utility to recursively clear values in an object
const clearStructure = obj => {
  const newObj = {}
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      newObj[key] = clearStructure(obj[key])
    } else {
      newObj[key] = '...'
    }
  }
  return newObj
}

program.name('lang-manager-ext').description('Manage languages in the system')

program
  .command('add <langCode>')
  .description('Add a new language to the system')
  .action(async langCode => {
    const code = langCode.toLowerCase().trim()
    const newFileName = `${code}.json`
    const newFilePath = path.join(DICT_DIR, newFileName)

    // 1. Check if language already exists
    if (fs.existsSync(newFilePath)) {
      console.error(chalk.red(`Error: Language "${code}" already exists at ${newFilePath}`))
      process.exit(1)
    }

    // 2. Load base dictionary (prefer en.json)
    const baseLang = fs.existsSync(path.join(DICT_DIR, 'en.json')) ? 'en.json' : 'pt.json'
    const basePath = path.join(DICT_DIR, baseLang)

    if (!fs.existsSync(basePath)) {
      console.error(chalk.red(`Error: Base dictionary (${baseLang}) not found.`))
      process.exit(1)
    }

    console.log(chalk.blue(`Creating new language "${code}" using "${baseLang}" as template...`))

    const baseData = JSON.parse(fs.readFileSync(basePath, 'utf8'))
    const clearedData = clearStructure(baseData)

    // 3. Write new dictionary file
    fs.writeFileSync(newFilePath, JSON.stringify(clearedData, null, 2) + '\n', 'utf8')
    console.log(chalk.green(`✓ Created ${newFileName}`))

    // 4. Register in dictionaries.ts
    if (fs.existsSync(DICT_TS_PATH)) {
      let content = fs.readFileSync(DICT_TS_PATH, 'utf8')

      if (content.includes(`${code}: () =>`)) {
        console.warn(
          chalk.yellow(`Warning: "${code}" already seems to be registered in dictionaries.ts`),
        )
      } else {
        const entry = `  ${code}: () => import('../../dictionaries/${code}.json').then(module => module.default),\n`
        content = content.replace(/const dictionaries = \{/, `const dictionaries = {\n${entry}`)

        fs.writeFileSync(DICT_TS_PATH, content, 'utf8')
        console.log(chalk.green(`✓ Registered "${code}" in dictionaries.ts`))
      }
    }

    // 5. Add to all dictionaries' locale_switcher section
    const allFiles = getDictFiles()
    for (const file of allFiles) {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'))
      if (data.locale_switcher) {
        data.locale_switcher[code] = '...'
        fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
        console.log(chalk.green(`✓ Added label for "${code}" in ${path.basename(file)}`))
      }
    }

    console.log(chalk.bold.green(`\nLanguage "${code}" added successfully!`))
    console.log(chalk.gray(`You can now use "npm run lang:update" to translate specific keys.`))
  })

program
  .command('remove <langCode>')
  .description('Remove a language from the system')
  .action(async langCode => {
    const code = langCode.toLowerCase().trim()
    const fileName = `${code}.json`
    const filePath = path.join(DICT_DIR, fileName)

    if (code === 'en' || code === 'pt') {
      console.error(chalk.red(`Error: Cannot remove core language "${code}".`))
      process.exit(1)
    }

    // 1. Remove JSON file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(chalk.green(`✓ Removed ${fileName}`))
    } else {
      console.warn(chalk.yellow(`Warning: ${fileName} not found.`))
    }

    // 2. Unregister in dictionaries.ts
    if (fs.existsSync(DICT_TS_PATH)) {
      let content = fs.readFileSync(DICT_TS_PATH, 'utf8')
      const entryRegex = new RegExp(
        `\\s+${code}: \\(\\) => import\\('\\.\\.\\/\\.\\.\\/dictionaries\\/${code}\\.json'\\)\\.then\\(module => module\\.default\\),?\\n?`,
        'g',
      )

      if (entryRegex.test(content)) {
        content = content.replace(entryRegex, '')
        fs.writeFileSync(DICT_TS_PATH, content, 'utf8')
        console.log(chalk.green(`✓ Unregistered "${code}" from dictionaries.ts`))
      }
    }

    // 3. Remove from all dictionaries' locale_switcher section
    const allFiles = getDictFiles()
    for (const file of allFiles) {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'))
      if (data.locale_switcher && data.locale_switcher[code]) {
        delete data.locale_switcher[code]
        fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
        console.log(chalk.green(`✓ Removed label for "${code}" in ${path.basename(file)}`))
      }
    }

    console.log(chalk.bold.green(`\nLanguage "${code}" removed successfully!`))
  })

program.parse()
