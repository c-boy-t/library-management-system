"use client"

import { type LucideIcon } from 'lucide-react'
import { type Control, type FieldValues, type Path } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface AuthInputFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label: string
  placeholder: string
  icon: LucideIcon
  type?: string
  autoComplete?: string
}

/**
 * 认证页面输入项。
 */
export function AuthInputField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  icon: Icon,
  type = 'text',
  autoComplete,
}: AuthInputFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                autoComplete={autoComplete}
                className="bg-secondary pl-10"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
