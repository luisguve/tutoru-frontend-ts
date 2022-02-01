// import DynamicLinks from "./DynamicLinks"
import StaticLinks from "./StaticLinks"

const Menu = () => {
  return (
    <ul className="navbar-nav">
      {/*<DynamicLinks />*/}
      <StaticLinks />
    </ul>
  )
}

export default Menu
