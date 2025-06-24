import { Button, Flex, Menu } from "antd";

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
            <div style={{display:"flex", flexDirection:"column", gap:"20px"}}>
                <Button size="large">Create List</Button>
                <Menu
                    items={item}
                />
            </div>
            <div className="listContainer">
                
            </div>
        </div>
    )
}