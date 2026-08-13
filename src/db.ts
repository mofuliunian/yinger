import Dexie, { type Table } from 'dexie'
import type { BabyEvent } from './types'

export interface Setting {
  key: string
  value: any
}

class BabyDB extends Dexie {
  events!: Table<BabyEvent, number>
  settings!: Table<Setting, string>

  constructor() {
    super('baby-tracker')
    this.version(1).stores({
      events: '++id, type, time',
      settings: 'key',
    })
  }
}

export const db = new BabyDB()
