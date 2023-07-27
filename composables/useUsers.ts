
const useUsers = () => {
    // const usersState = reactive({
    //     data: [],
    //     fetching: false,
    // });
    const usersState:Ref = useState(
        'usersState',
        () => {
          return {
            data: [],
            fetching: false,
        };
        },
      );
    async function fetchUser(value:string){
        usersState.value.fetching = true
        const response = await $fetch('/api/users', {
            params: {
                search: value
            }
        })
        usersState.value.data = response.map((user:any) => ({
            label: user.name,
            value: user.id,
        }));
        usersState.value.fetching = false
    }
    function add(users:Array<any>){
        for(const user of users){
            if(!usersState.value.data.find(x=>x.value==user.id))usersState.value.data.push({
                label: user.name,
                value: user.id
            })
        }
    }

    return {
        usersState,
        fetchUser,
        add
    }
    // return Object.assign(usersState, {
    //     fetchUser,
    //     add,
    // });
  
}

export default useUsers