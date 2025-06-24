import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import AllSections from './endpoints/sections/AllSections';
import { Route, Routes, HashRouter, Link, useLocation, useNavigate } from 'react-router-dom';
import SectionMacros from './endpoints/sections/SectionMacrosPage';
import NotFoundPage from './endpoints/other/NotFoundPage';
import { Toaster, toast } from 'sonner'
import { JsonProvider, useJson } from './components/getLanguageJson';
import Credits from './components/Credits';
import { Button, ConfigProvider, Tabs, theme } from 'antd';
import MacrosHistoryPage from './endpoints/history/MacrosHistoryPage';
import fetchWrapper from './utils/fetchWrapper';
import getApi from './utils/api';
import ListsPage from './endpoints/other/ListsPage';

export default function(){
    const {json, language, updateLanguage} = useJson()
    const [api, setAapi] = useState(null)

    useEffect(() => {
        
        async function AwaitApi(){
          setAapi(await getApi())
        }
        AwaitApi()

        
      }, [api]);



    const location = useLocation();
    const navigate = useNavigate();

    const activeKey = location.pathname.split('/').pop() || '';
    const items = [
        { key: 'lists', label: 'Lists'},
        { key: '', label: 'Home'},
        { key: 'history', label: 'History'},
    ];

    return(
    <>
        
            <div className='navBar'>
                <Tabs
                    size='large'
                    items={items}
                    activeKey={activeKey}
                    onChange={(key) => navigate(`/${key}`)}
                />
            </div>
                    <Toaster richColors/>
                    <ConfigProvider
                        theme={{
                            token: {
                            colorPrimary:"#2382BA",
                            colorError:"#EA5B5B",
                            colorSuccess:"#7AEA5B"
                            }
                        }}
                    >   
                        <Routes>
                            <Route path='/' element={<AllSections api={api} json={json}/>}/>
                            <Route path='/history' element={<MacrosHistoryPage api={api} json={json}/>}/>
                            <Route path='/lists' element={<ListsPage/>}/>
                            <Route path='/section/:section' element={<SectionMacros api={api} json={json}/>}/>
                            <Route path='/*' element={<NotFoundPage/>}/>
                        </Routes>
                    </ConfigProvider>

    </>
    )

};

