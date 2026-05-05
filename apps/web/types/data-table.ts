import type { CommonNotificationDictionary } from '@/types/api'

export interface DataTableDict {
  common: {
    table: {
      status_active: string
      status_inactive: string
      view_more: string
      view_less: string
      no_results: string
      search_placeholder: string
      next_button: string
      previous_button: string
      rows_per_page: string
      selected_rows: string
      column_actions: string
      column_status: string
      column_updated_at: string
      actions: {
        column: string
        update: string
        delete: string
        refresh: string
        create: string
      }
    }
    form: {
      actions: {
        save: string
        saving: string
        discard: string
        back: string
      }
    }
    dialogs: {
      delete_confirm: {
        title: string
        description: string
        confirm: string
        cancel: string
      }
      update_dialog: {
        title: string
        description: string
        discard: string
        save: string
      }
      create_dialog: {
        title: string
        description: string
        cancel: string
        save: string
      }
    }
    notifications: CommonNotificationDictionary
  }
}
