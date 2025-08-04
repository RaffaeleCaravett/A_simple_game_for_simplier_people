import { RxStompConfig } from '@stomp/rx-stomp';
import { environment } from './environment';


export const myRxStompConfig: RxStompConfig = {

    reconnectDelay: 20000,

    debug: (msg: string): void => {
        if (!environment.API_URL) {
            console.log(msg);
        }
    },
};