'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

type InputPasswordProps = React.ComponentProps<'input'>

export function InputPassword({ className, ...props }: InputPasswordProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  return (
    <InputGroup className={className}>
      <InputGroupInput type={showPassword ? 'text' : 'password'} {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
          type="button"
        >
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
