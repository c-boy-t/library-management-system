"use client"

import type { ReactNode } from 'react'
import { type Control, type FieldValues, type Path } from 'react-hook-form'

import { Checkbox } from '@/components/ui/checkbox'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface AuthCheckboxFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label: ReactNode
}

/**
 * 认证页面复选项。
 */
export function AuthCheckboxField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
}: AuthCheckboxFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-start gap-2 space-y-0">
          <FormControl>
            <Checkbox
              checked={Boolean(field.value)}
              onCheckedChange={(checked) => field.onChange(Boolean(checked))}
              className="mt-1"
            />
          </FormControl>
          <div className="leading-relaxed">
            <FormLabel className="cursor-pointer text-sm font-normal">{label}</FormLabel>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  )
}
