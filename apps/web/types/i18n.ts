export interface Dictionary {
  common: {
    breadcrumb: {
      parameters: string
      settings: string
    }
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
      is_active: {
        label: string
      }
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
    notifications: {
      http_status: {
        [key: string]: string
      }
      success_update: string
      success_create: string
      success_delete: string
      error: string
      info: string
    }
    components: {
      locale_switcher: {
        label: string
        en: string
      }
      theme_toggle: {
        label: string
        light: string
        dark: string
        system: string
      }
      input_upload: {
        title: string
        title_dragging: string
        description_single: string
        description_multiple: string
        browse: string
        aria_label: string
        aria_upload_area: string
        aria_remove: string
        replace: string
        remove: string
        error_max_files: string
        error_max_files_plural: string
        error_size: string
        error_size_plural: string
      }
    }
  }
  auth_layout: {
    footer: {
      rights: string
      privacy_terms: string
      system_policies: string
      close: string
      privacy_content: string
      policies_content: string
    }
    typewriter_phrases: string[]
  }
  sign_in: {
    form: {
      cards: {
        information: {
          title: string
          description: string
        }
      }
      email: {
        label: string
        placeholder: string
      }
      password: {
        label: string
        placeholder: string
      }
      forgot_password: {
        label: string
      }
      submit: {
        label: string
        loading_text: string
      }
    }
    notifications: {
      http_status: {
        [key: string]: string
      }
    }
  }
  forgot_password: {
    notifications: {
      http_status: {
        [key: string]: string
      }
      success_forgot_password: string
      error_forgot_password: string
    }
    form: {
      cards: {
        information: {
          title: string
          description: string
        }
      }
      email: {
        label: string
        placeholder: string
      }
      submit: {
        label: string
        loading_text: string
      }
      back_to_login: {
        label: string
      }
    }
  }
  verify_otp: {
    notifications: {
      http_status: {
        [key: string]: string
      }
      success_verify_otp: string
      error_verify_otp: string
      success_resend_otp: string
    }
    form: {
      cards: {
        information: {
          title: string
          description: string
        }
      }
      otp_code: {
        label: string
      }
      submit: {
        label: string
        loading_text: string
      }
      resend: {
        label: string
      }
      back_to_login: {
        label: string
      }
    }
  }
  reset_password: {
    notifications: {
      http_status: {
        [key: string]: string
      }
      success_reset_password: string
      error_reset_password: string
    }
    form: {
      cards: {
        information: {
          title: string
          description: string
        }
      }
      email: {
        label: string
      }
      password: {
        label: string
        placeholder: string
      }
      confirm_password: {
        label: string
        placeholder: string
      }
      submit: {
        label: string
        loading_text: string
      }
      security_rules: {
        title: string
        min_chars: string
        number: string
        uppercase: string
        lowercase: string
        special: string
      }
    }
  }
  screen_parameters: {
    table: {
      column_key: string
      column_title: string
      column_description: string
    }
    form: {
      title: {
        label: string
        placeholder: string
        description: string
      }
      description: {
        label: string
        placeholder: string
        description: string
      }
      is_active: {
        description: string
      }
    }
    notifications?: {
      http_status?: {
        [key: string]: string
      }
    }
  }
  general: {
    form: {
      cards: {
        information: {
          title: string
          description: string
        }
        media: {
          title: string
          description: string
        }
      }
      name: {
        label: string
        placeholder: string
        description: string
      }
      domain: {
        label: string
        placeholder: string
        description: string
      }
      description: {
        label: string
        placeholder: string
        description: string
      }
      is_active: {
        description: string
      }
    }
    notifications: {
      http_status: {
        '409': string
      }
    }
  }
  users: {
    notifications: {
      success_resend_reset: string
    }
    table: {
      column_name: string
      column_email: string
      actions: {
        resend_reset: string
      }
    }
    form: {
      cards: {
        information: {
          title: string
          description: string
        }
        teams_profiles: {
          title: string
          description: string
        }
      }
      name: {
        label: string
        placeholder: string
        description: string
      }
      email: {
        label: string
        placeholder: string
        description: string
      }
      is_active: {
        description: string
      }
      table_teams_profiles: {
        column_teams: string
        column_access_profiles: string
        add_button: string
        select_team_placeholder: string
        select_access_profile_placeholder: string
        empty_teams_profiles: string
      }
    }
  }
  access_profiles: {
    notifications: {
      http_status: {
        '409': string
      }
    }
    table: {
      column_name: string
      column_description: string
    }
    form: {
      cards: {
        information: {
          title: string
          description: string
        }
        permissions: {
          title: string
          description: string
        }
      }
      name: {
        label: string
        placeholder: string
        description: string
      }
      description: {
        label: string
        placeholder: string
        description: string
      }
      is_active: {
        description: string
      }
      table_permissions: {
        column_screens: string
        add_button: string
        select_screen_placeholder: string
        permission_view: string
        permission_create: string
        permission_update: string
        permission_delete: string
      }
    }
  }
  teams: {
    notifications: {
      http_status: {
        '409': string
      }
    }
    table: {
      column_name: string
      column_icon: string
    }
    form: {
      name: {
        label: string
        placeholder: string
        description: string
      }
      icon: {
        label: string
        placeholder: string
        description: string
      }
      is_active: {
        description: string
      }
    }
  }
  sidebar: {
    groups: {
      platform: string
    }
    nav_main: {
      dashboard: string
      settings: string
      general: string
      teams: string
      parameters: string
      screen_parameters: string
      access_profiles: string
      users: string
    }
  }
  forbidden_page: {
    title: string
    description: string
    back_button: string
  }
}

export type Locale = 'en'

export interface I18nConfig {
  defaultLocale: Locale
  locales: Locale[]
}
