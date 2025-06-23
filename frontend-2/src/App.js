import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import AllSections from './endpoints/sections/AllSections';
import { Route, Routes, HashRouter, Link } from 'react-router-dom';
import SectionMacros from './endpoints/sections/SectionMacros';
import NotFoundPage from './endpoints/other/NotFoundPage';
import { Toaster, toast } from 'sonner'
import { JsonProvider, useJson } from './components/getLanguageJson';
import Credits from './components/Credits';
import { Button, ConfigProvider, theme } from 'antd';
import MacrosHistory from './endpoints/history/MacrosHistory';

export default function(){
    const [page, setPage] = useState("mainNav");
    const json = useJson()
    return(
    <>
        <HashRouter>
            <div className='navBar'>
                <div className='navBarCollection'>
                    <Link id = "favoriteNav" onClick={() =>setPage("favoriteNav")} className={`navBarItem ${page=="favoriteNav"?"activatedNavBarItem":""}`} to={"/"}>Favorites</Link>

                    <Link id = "mainNav" onClick={() =>setPage("mainNav")} className={`navBarItem ${page=="mainNav"?"activatedNavBarItem":""}`} to={"/"}>MainPage</Link>

                    <Link id = "historyNav" onClick={() =>setPage("historyNav")} className={`navBarItem ${page=="historyNav"?"activatedNavBarItem":""}`} to={"/history/macros"}>History</Link>
                </div>
                <div style={{opacity:"0.2", margin:"10px"}} className='lineBreaker'></div>
            </div>
                    <Toaster richColors/>
                    <ConfigProvider
                        theme={{
                            token: {
                            colorPrimary:"#2382BA",
                            colorError:"#EA5B5B",
                            colorSuccess:"#7AEA5B"
                            //# 004C97
                            //# A4D8E3
                            //# 0090C5
                            //# 2382BA
                            //# 96CBE2
                            }
                        }}
                    >   
                        <Routes>
                            <Route path='/' element={<AllSections/>}/>
                            <Route path='/history/macros' element={<MacrosHistory/>}/>

                            <Route path='/section/:section' element={<SectionMacros/>}/>
                            <Route path='/*' element={<NotFoundPage/>}/>
                        </Routes>
                    </ConfigProvider>
    </HashRouter>

    </>
    )

};

