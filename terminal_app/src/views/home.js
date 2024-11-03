const {
  UIComponentV2,
} = require("../Components/UIComponent");
const {useState, useEffect} = require("../../hooks");
const { navigate } = require("../../router");


function Menu({items,props }){
  const MenuContainer = new UIComponentV2({
    ...props
  })
  items.forEach((element) => {
    new UIComponentV2({
      parent: MenuContainer,
      content: element.label,
      type: "layout",
      width: "100%-2",
      height: "shrink",
      style: {
        hover: {
          bg: 'grey'
        },
        focus: {
          border: {
            fg: 'grey'
          }
        }
      }
    }).on("click",element.onClick)
  });
  return MenuContainer
}

function ProfileDropDown(screen,parent){
  const [showItem, setShowItem] = useState(false)

  const Trigger = new UIComponentV2({
    parent,
    width:"20%",
    type: "box",
    border: { type: "line" },
    content:"profile",
  })

  Trigger.on("click", () => {
    setShowItem((prev) => {
      return !prev;
    });
  });

  const Items = Menu({
    props: {
      type: "layout",
      width: "20%",
      height: "22%",
      top: 2,
      right: 8,
    },
    items: [
      { label: "Settings",onClick:()=>{
        setShowItem(false)
        navigate("/settings",screen)
      } },
      { label: "Theme",onClick:()=>{
        setShowItem(false)
        navigate("/settings",screen)
      }  },
      { label: "Switch Profle",onClick:()=>{
        setShowItem(false)
        navigate("/settings",screen)
      }  },
    ],
  });

  useEffect(()=>{
    if(showItem.value){
      screen.append(Items)
      screen.render()
    }else{
      screen.remove(Items)
      screen.render()
    }
  },[showItem])

  return Trigger
}

function Home(screen) {
  const [showProfile, setShowProfile] = useState(false)

  const Container = new UIComponentV2({
    parent: screen,
    width: "100%",
    type: "layout",
    padding:0,
    scrollable: true,
  });

  const Header = new UIComponentV2({
    screen,
    parent: Container,
    type: "layout",
    height: "10%-1",
    padding:-1,
    border: {
      type: 'bg'
    },
  });

  
  new UIComponentV2({
    parent: Header,
    width:"10%",
    type: "box",
    content:"logo",
    
  })
  
  new UIComponentV2({
    parent: Header,
    width:"70%",
    type: "box",
    content:"navlink",
    border: {
      type: 'bg'
    },
  })

  const Profile = ProfileDropDown(screen,Header)

  const Content = new UIComponentV2({
    screen,
    parent: Container,
    type: "layout",
    height: "90%",
    border: {
      type: 'line'
    },
  });

  const SideNav = Menu({
    items: [{ label: "1" }, { label: "2" }, { label: "3" }, { label: "4" }],
    props: {
      screen,
      parent: Content,
      content: `20%`,
      type: "layout",
      width: "20%",
      border: {
        type: "bg",
      },
    },
  });

  const Body = new UIComponentV2({
    screen,
    parent: Content,
    type: "box",
    width: "80%-1",
    height: "shrink",
    content: `80%`,
    top:10
  });

  const Footer = new UIComponentV2({
    screen,
    parent: Content,
    type: "layout",
    height: "shrink",
    border: {
      type: 'line'
    },
  })

  
}

module.exports = Home;
