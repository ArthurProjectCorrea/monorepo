import type { CommonNotificationDictionary } from './api'

export interface DataTableDict {
  common: {
    actions: {
      edit: string
      delete: string
      refresh: string
      view_more: string
      view_less: string
    }
    table: {
      search_placeholder: string
      columns_button: string
      next_button: string
      previous_button: string
      rows_per_page: string
      selected_rows: string
      no_results: string
      actions_column: string
    }
    dialogs: {
      delete_confirm: {
        title: string
        description: string
        cancel: string
        confirm: string
      }
      edit_dialog: {
        title: string
        description: string
        cancel: string
        save: string
      }
    }
    notifications: CommonNotificationDictionary
  }
}
