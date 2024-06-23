import axios from 'axios';

export class NotificationsService {
  constructor(private token: string, private environmentId: string) {}

  async triggerEvent(name: string, subscriberId: string, payload = {}) {
    await axios.post(
      'http://127.0.0.1:1336/v1/events/trigger',
      {
        name,
        to: subscriberId,
        payload,
      },
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Novu-Environment-Id': this.environmentId,
        },
      }
    );
  }
}
