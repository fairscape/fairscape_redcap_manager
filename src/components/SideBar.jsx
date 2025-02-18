import React from "react";
import { Sidebar, Logo, SidebarContent, SidebarItem } from "./styles";
import logoSvg from "../assets/logo.svg";

const sidebarItems = [
  {
    text: "Options",
    action: "questionnaire",
  },
  {
    text: "Manage Projects",
    action: "add-project",
  },
  {
    text: "RO-Crate Initialization",
    action: "init-crate",
  },
  {
    text: "View/Export Project Data",
    action: "download",
  },
  {
    text: "Preview & Validate",
    action: "preview",
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
