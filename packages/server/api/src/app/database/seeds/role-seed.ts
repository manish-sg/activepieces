import { system } from '../../helper/system/system'
import { DataSeed } from './data-seed'

export const rolesSeed: DataSeed = {
    run: async () => {
        system.globalLogger().info({ name: 'rolesSeed' }, 'Seeding roles (no-op in community edition)')
    },
}