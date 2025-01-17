import React, { useState } from "react";
import Avatar from "../common/Avatar";
import { useStateProvider } from "@/context/StateContext";
import {BsFillChatLeftTextFill, BsThreeDotsVertical} from "react-icons/bs"
import { reducerCases } from "@/context/constants";
import { GoogleAuthProvider, getAuth, signInWithPopup, signOut } from "firebase/auth";
import { useRouter } from "next/router";
import ContextMenu from "../common/ContextMenu";

function ChatListHeader() {
 const [{userInfo}, dispatch] = useStateProvider();
 const router = useRouter();
 const [contextMenuCordinates, setContextMenuCordinates] = useState({
  x: 0,
  y: 0,
 });
 const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);

 const showContextMenu = (e) =>{
  e.preventDefault();
  setContextMenuCordinates({x: e.pageX, y: e.pageY});
  setIsContextMenuVisible(true);
 }
 const contextMenuOptions = [
  {
    name: "logout",
    callback: async ()=>{
      setIsContextMenuVisible(false);
      router.push("/logout");
    }
  }
 ]
 


const handleAllContactPage = ()=>{
  dispatch({type: reducerCases.SET_ALL_CONTACTS_PAGE});
}
// const auth = getAuth();

// const handleLogout= () => {
  
//   signOut(auth)
//   .then(()=>{
//       // setUser([]);
//   })
//   // .finally(()=>{setIsLogin(false)})
// }

 return (<div className="h-16 px-4 py-3 flex justify-between items-center">
  <div className="curson-pointer">
    <Avatar type="sm" image={userInfo?.profileImage}/>
  </div>
  <div className="flex gap-6">
    <BsFillChatLeftTextFill 
    className="text-panel-header-icon cursor-pointer text-xl"
    title="New Chat"
    onClick={handleAllContactPage}
    />
    <>
    <BsThreeDotsVertical
    className="text-panel-header-icon cursor-pointer text-xl"
    title="Menu"
    onClick={(e)=> showContextMenu(e)}
    id="context-opener"
    />
    {
      isContextMenuVisible && (
        <ContextMenu
        options={contextMenuOptions}
        cordinates={contextMenuCordinates}
        contextMenu={setContextMenuCordinates}
        setContextMenu={setIsContextMenuVisible}
        />
      )
    }
    {/* <button onClick={handleLogout}>Logout</button> */}
    </>
  </div>
  </div>);
}

export default ChatListHeader;
