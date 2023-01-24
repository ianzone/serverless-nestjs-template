import { AppSecrets } from './interfaces'

// TODO: fetch from aws secret manager
export async function fetchSecrets() {
  const appSecrets: AppSecrets[] = [{
    cognito: {
      userPoolId: '',
      clientId: ['']
    },
    thirdParty: {
      clientId: '',
      clientSecret: ''
    }
  }]
  return appSecrets
}