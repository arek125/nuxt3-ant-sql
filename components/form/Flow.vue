<script lang="ts" setup>
    import type { FormInstance,SelectProps } from 'ant-design-vue';
    import type { Rule } from 'ant-design-vue/es/form';

    //const authState = useAuthState()
    //const { setAlert } = useAlert()
    const alert = useAlert();
    const props = defineProps({
      flowData: {
        type: [Object],
        //default: {id: null, name: '', stages: [] }
      },
      allFlows: Array
    })
    
    let flow:any = reactive({id: null, name: '', active: true, stages: [], type: 'OneByOne' })
    //let flow = toRef(props,'flowData')
    const { usersState, fetchUser, add: initUsers } = useUsers()
    const prefillOptions = ref([])
    onMounted(()=>{
        if(props.flowData)Object.assign(flow, props.flowData)
        for(let stage of flow.stages){
            // for(const user of stage.users){
            //     if(!usersState.data.find(x=>x.value==user.id))usersState.data.push({
            //         label: user.name,
            //         value: user.id
            //     })
            // }
            initUsers(stage.users)
            stage.users = stage.users.map(x=>x.id)
        }
        //prefillOptions.value = props.allFlows?.map((x:any)=>{return {value: x.id, label: x.name}})
        if(props.allFlows?.length)Object.assign(prefillOptions.value, props.allFlows.map((x:any)=>{return {value: x.id, label: x.name}}))
    })
    
    const formRef = ref<FormInstance>();
    
    const rules: Record<string, Rule[]> = {
        name: [{ required: true, message: 'Flow name is required !', trigger: 'change'}],
        type: [{ required: true, message: 'Flow type is required !', trigger: 'change'}],
        //flowId: [{ required: true, message: 'Please pick doc flow !'}],
    };
    const pagination = {
      onChange: (page: number) => {
        console.log(page);
      },
      pageSize: 5,
    };

    
    function saveFlow(){
        if(!flow.id){//new flow
            $fetch('/api/flows', {
                method: 'POST',
                body: { ...flow },
            })
            .then((response: any) => {
                navigateTo('/flows/'+response.id)
            })
            .catch((e) => {
                alert.set('error',e)
                console.error(e);
            });
        }else{
            $fetch('/api/flows/'+flow.id, {
                method: 'POST',
                body: { ...flow },
            })
            .then((response: any) => {
                alert.set('success','Flow updated')
            })
            .catch((e) => {
                alert.set('error',e)
                console.error(e);
            });
        }
    }

    function removeFlow(){
        $fetch('/api/flows/'+flow.id, {
                method: 'DELETE',
            })
            .then((response: any) => {
                alert.set('success','Flow updated')
                navigateTo('/flows')
            })
            .catch((e) => {
                alert.set('error',e)
                console.error(e);
            });
    }
    
    const onDelete = (index:Number) => {
        flow.stages = flow.stages.filter(x => x.index !== index);
        flow.stages = flow.stages.map(x=> {
            if(x.index>index)x.index--
            return x
        })
    };

    function createStage(){
        flow.stages.push({
            index: flow.stages.length,
            name: '', 
            type: null, 
            users:[], 
            notificationTitle: 'New task: [name]', 
            notificationBody: '<p><b>New task has been assigned to You.</b></p> <p>Click <a href="[link]">here</a> to open.</p>',
            percentToComplete: null,
            assignType: null,
            assignBeforeIndex: null
        })
    }
    const loadStages = (value: string) => {
      console.log(`selected ${value}`);
      let prefilFlow:any = props.allFlows?.find((x:any)=>x.id == value)
      flow.stages = [...prefilFlow.stages]
      for(let stage of flow.stages){
            initUsers(stage.users)
            stage.users = stage.users.map(x=>x.id)
        }
    };

    </script>
    
    <template>
    <div>
    <a-card :title="flow.id?'Flow: '+flow.id:'New Flow'">
        <a-form
            ref="formRef"
            :model="flow"
            :rules="rules"
            @finish="saveFlow"
        >
            <a-row :gutter="24">
                <a-col :span="8">
                    <a-form-item label="Name" name="name">
                        <a-input v-model:value="flow.name" />
                    </a-form-item>
                </a-col>
                <a-col :span="6">
                    <a-form-item label="Type" name="type">
                        <a-select
                            v-model:value="flow.type"
                            placeholder="Select a flow type"
                            :options="[{label: 'Assign tasks one by one', value: 'OneByOne'},{label: 'Assign tasks all at once', value: 'AllAtOnce'}]"
                        ></a-select>
                    </a-form-item>
                </a-col>
                <a-col :span="7" v-if="!flow.id">
                    <a-form-item label="Prefill stages from" name="prefillStages">
                        <a-select
                            placeholder="Select a flow"
                            :options="prefillOptions"
                            @change="loadStages"
                        ></a-select>
                    </a-form-item>
                </a-col>
                <a-col :span="3">
                    <a-form-item label="Active" name="active">
                        <a-switch v-model:checked="flow.active" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="24">
                <a-divider>Stages</a-divider>
            </a-row>
            <a-row :gutter="24">
                <a-list item-layout="vertical" size="large" :pagination="pagination" :data-source="flow.stages" :rowKey="record => record.id">
                    <template #renderItem="{ item , index }">
                        <a-card :title="'Stage '+(index+1)">
                            <a-form>
                                <a-row :gutter="24">
                                    <a-col :span="8">
                                        <a-form-item label="Name" :rules="[{ required: true, message: 'input something' }]">
                                            <a-input v-model:value="item.name"/>
                                        </a-form-item>
                                    </a-col>
                                    <a-col :span="4">
                                        <a-form-item label="Type" :rules="[{ required: true, message: 'select something' }]">
                                            <a-select
                                                v-model:value="item.type"
                                                :options="[{value: 'OneAction', label: 'One Action'},{value: 'PercentAction', label: 'Percent Action'}]"
                                            ></a-select>
                                        </a-form-item>
                                    </a-col>
                                    <a-col :span="4" v-if="item.type == 'PercentAction'">
                                        <a-form-item label="Percent to approve" :rules="[{ required: true, message: 'input something' }]">
                                            <a-input-number v-model:value="item.percentToComplete" min="1" max="100"
                                            :formatter="value => `${value}%`"
                                            :parser="value => value.replace('%', '')"
                                            />
                                        </a-form-item>
                                    </a-col>
                                    <a-col :span="4">
                                        <a-form-item label="Assign type" :rules="[{ required: true, message: 'select something' }]">
                                            <a-select
                                                v-model:value="item.assignType"
                                                :options="[{value: 'Static', label: 'Static'},{value: 'PreSelect', label: 'Pre select'}]"
                                            ></a-select>
                                        </a-form-item>
                                    </a-col>
                                    <a-col :span="4" v-if="item.assignType == 'PreSelect'">
                                        <a-form-item label="Assign before index" :rules="[{ required: false, message: 'input something' }]">
                                            <a-input-number v-model:value="item.assignBeforeIndex" min="0" :max="index"/>
                                        </a-form-item>
                                    </a-col>
                                    <a-col :span="8">
                                        <a-form-item label="Users" :rules="[{ required: item.assignType=='Static', message: 'select something' }]">
                                            <a-select
                                                v-model:value="item.users"
                                                mode="multiple"
                                                placeholder="Select users"
                                                :filter-option="false"
                                                :not-found-content="usersState.fetching ? undefined : null"
                                                :options="usersState.data"
                                                @search="fetchUser"
                                            >
                                                <template v-if="usersState.fetching" #notFoundContent>
                                                    <a-spin size="small" />
                                                </template>
                                            </a-select>
                                        </a-form-item>
                                    </a-col>
                                    <a-col :span="6">
                                        <a-form-item label="Notification title" :rules="[{ required: true, message: 'input something' }]">
                                            <a-input v-model:value="item.notificationTitle"/>
                                        </a-form-item>
                                    </a-col>
                                    <a-col :span="10">
                                        <a-form-item label="Notification body" :rules="[{ required: true, message: 'input something' }]">
                                            <a-textarea v-model:value="item.notificationBody" />
                                        </a-form-item>
                                    </a-col>
                                </a-row>
                                <a-row>
                                    <a-col :span="24" style="text-align: right">
                                        <a-button type="primary" shape="round" v-if="item.index > 0" @click="item.index--;flow.stages[index-1].index++; flow.stages = flow.stages.sort((a, b) => parseInt(a.index) - parseInt(b.index))">
                                            <template #icon>
                                                <mdi-arrow-up-bold />
                                            </template>
                                        </a-button>
                                        <a-button type="primary" shape="round" v-if="item.index < (flow.stages.length-1)" @click="item.index++;flow.stages[index+1].index--; flow.stages = flow.stages.sort((a, b) => parseInt(a.index) - parseInt(b.index))">
                                            <template #icon>
                                                <mdi-arrow-down-bold />
                                            </template>
                                        </a-button>
                                        <a-popconfirm v-if="flow.stages.length" title="Sure to delete?" @confirm="onDelete(item.index)">
                                            <a-button type="primary" shape="round">
                                                <template #icon>
                                                    <mdi-delete />
                                                </template>
                                            </a-button>
                                        </a-popconfirm>
                                    </a-col>
                                </a-row>
                            </a-form>
                        </a-card>
                        <br />
                    </template>
                    <template #footer>
                        <a-button type="primary" shape="round" @click="createStage">
                            <template #icon>
                                <mdi-plus />
                            </template>
                            Add stage
                        </a-button>
                    </template>
                </a-list>
            </a-row>
            <br />
            <a-row justify="end" :gutter="24">
                <a-col class="gutter-row" v-if="flow.id">
                    <a-button  type="primary" danger @click="removeFlow">Remove</a-button>
                </a-col>
                <a-col class="gutter-row">
                    <a-button type="primary" html-type="submit">Save</a-button>
                </a-col>
            </a-row>
        </a-form>
    </a-card>
    </div>
    </template>