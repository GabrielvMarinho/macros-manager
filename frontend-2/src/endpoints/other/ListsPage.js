import { Button, Divider, Menu } from "antd";

export default function(){
    const item =[
        {
            key: 'grp',
            label: 'Lists',
            type: 'group',
            children: [
            { key: '13', label: 'Option 13' },
            { key: '14', label: 'Option 14' },
            ],
        }
    ]
    return(
        <div className='mainContainer'>  
            <Button size="large">Create List</Button>
            <Divider></Divider>
            <Menu
                items={item}
            />
        </div>
    )
}