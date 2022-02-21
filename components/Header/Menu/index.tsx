import DynamicLinks from "./DynamicLinks"
import StaticLinks from "./StaticLinks"

import { INavigationItem } from "../../../lib/metadata"

interface MenuProps {
  navigation: INavigationItem[];
}
const Menu = (props: MenuProps) => {
  const { navigation } = props
  return (
    <ul className="navbar-nav">
      <DynamicLinks navigation={navigation} />
      <StaticLinks />
    </ul>
  )
}

export default Menu
