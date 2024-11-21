import React from "react";
import { Sidebar, Logo, SidebarContent, SidebarItem } from "./styles";
import logoSvg from "../assets/logo.svg";

const sidebarItems = [
  {
    text: "Options",
    action: "questionnaire",
  },
  {
    text: "REDCap Project Management",
    action: "add-project",
  },
  // {
  //   text: "View Project Data",
  //   action: "view-project",
  // },
  {
    text: "View/Export Project Data",
    action: "download",
  },
  {
    text: "De-Identify Data",
    action: "deidentify",
  },
  {
    text: "Package & Upload Data",
    action: "upload",
  },
];

const SidebarComponent = ({ currentView, setCurrentView }) => {
  return (
    <Sidebar>
      <Logo>
        <img src={logoSvg} alt="Logo" />
      </Logo>
      <SidebarContent>
        {sidebarItems.map((item, index) => (
          <SidebarItem
            key={index}
            active={currentView === item.action}
            onClick={() => setCurrentView(item.action)}
          >
            {item.text}
          </SidebarItem>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default SidebarComponent;
