//import { Ref } from 'nuxt3/dist/app/compat/capi'
 
type _Alert = {
    show: boolean;
    type: 'success'| 'info'| 'warning'| 'error';
    text: string;
}

export type Alert = Ref<_Alert> & {
    set(type,text): void,
    reset(): void,
}

const _defaultAlertState: _Alert = {
    show: false,
    type: 'info',
    text: ''
};

// export default function useAlert(): Alert {
//     const alert: Ref<_Alert> = useState(
//         'alert',
//         () => {
//           return _defaultAlertState;
//         },
//       );

//     return Object.assign(alert, {


//         set(type,text): void
//         {
//           Object.assign(alert.value, _defaultAlertState, {type, text: text.toString(), show: true})
//           setTimeout(()=>Object.assign(alert.value, _defaultAlertState), 5000)
//         },
    
//         reset(): void
//         {
//           Object.assign(alert.value, _defaultAlertState)
//         },
//       });
// }


const useAlert = () => {
  //const alert = ref(_defaultAlertState)
    const alert: Ref<_Alert> = useState(
        'alert',
        () => {
          return _defaultAlertState;
        },
      );
  return Object.assign(alert, {
      set(type,text): void {
        Object.assign(alert.value, _defaultAlertState, {type, text: text.toString(), show: true})
        setTimeout(()=>Object.assign(alert.value, _defaultAlertState), 10000)
      },
      reset(): void {
        Object.assign(alert.value, _defaultAlertState)
      },
  });
}

export default useAlert