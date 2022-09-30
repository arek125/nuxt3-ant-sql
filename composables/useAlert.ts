import { Ref } from 'nuxt3/dist/app/compat/capi'
 
 type _Alert = {
    show: boolean;
    type: 'success'| 'info'| 'warning'| 'error';
    text: string;
}

export type Alert = Ref<_Alert> & {
    //getAlert: () => Record<string, string>,
    set(type,text): void,
    reset(): void,
}

const _defaultAlertState: _Alert = {
    show: false,
    type: 'info',
    text: null
};

export default function useAlert(): Alert {
    const alert: Ref<_Alert> = useState(
        'alert',
        () => {
          return _defaultAlertState;
        },
      );

    return Object.assign(alert, {


        set(type,text): void
        {
          Object.assign(alert.value, _defaultAlertState, {type, text: text.toString(), show: true})
          setTimeout(()=>Object.assign(alert.value, _defaultAlertState), 5000)
        },
    
        reset(): void
        {
          Object.assign(alert.value, _defaultAlertState)
        },
      });
}
    
    // export const useAlert = () => {
    // const alert = useState<Alert>('alert', () => ({
    //     show: false,
    //     type: 'error',
    //     text: ''
    // }))
    // const setAlert = (type,text)=> {
    //     alert.value.type = type
    //     alert.value.show = true
    //     alert.value.text = text
    //     //setTimeout(resetAlert, 5000)
    // }
    // const resetAlert = ()=> {
    //     alert.value.type = 'error'
    //     alert.value.show = false
    //     alert.value.text = ''
    // }
    // return { alert, setAlert, resetAlert }
// }