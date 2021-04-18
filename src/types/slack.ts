interface ChannelCreated {
  type: 'channel_created'
  channel: {
    id: string
    is_channel: boolean
    name: string
    name_normalized: string
    created: number
    creator: string
    is_shared: boolean
    is_org_shared: boolean
  }
  event_ts: string
}

interface ChannelDeleted {
  type: 'channel_deleted'
  channel: string
  actor_id: string
  event_ts: string
}

interface ChannelArchiveOrUnarchive {
  type: 'channel_archive' | 'channel_unarchive'
  channel: string
  user: string
  is_moved?: number
  event_ts: string
}

interface EmojiChanged {
  type: 'emoji_changed'
  event_ts: string
}

interface EmojiAdd extends EmojiChanged {
  subtype: 'add'
  name: string
  value: string // url or alias:${original}
}

interface EmojiRemove extends EmojiChanged {
  subtype: 'remove'
  names: string[]
}

export interface EventBody {
  token: string
  team_id: string
  api_app_id: string
  event: ChannelCreated | ChannelDeleted | ChannelArchiveOrUnarchive | EmojiAdd | EmojiRemove
  type: string
  event_id: string
  event_time: number
  authorizations: [
    {
      enterprise_id: string | null
      team_id: string
      user_id: string
      is_bot: boolean
      is_enterprise_install: boolean
    },
  ]
  is_ext_shared_channel: boolean
  challenge?: boolean
}
