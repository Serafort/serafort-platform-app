/**
 * Curated icon registry for server-/AI-driven widget layouts.
 *
 * `DynamicLayoutWidget` renders icons named by runtime data (widget render
 * nodes), so it cannot use static path imports directly. Previously it did
 * `import * as MuiIcons from "@mui/icons-material"`, which forced the entire
 * ~2,100-icon set (~3.9 MB) into the eager bundle.
 *
 * This module maps the common Material icon names to tree-shakeable path
 * imports. Unknown names fall back to `Circle` (handled by the caller). To
 * support a new icon in dynamic layouts, add a path import + registry entry
 * here.
 */
import type { SvgIconComponent } from "@mui/icons-material";

import Add from "@mui/icons-material/Add";
import AddCircle from "@mui/icons-material/AddCircle";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import ArrowForward from "@mui/icons-material/ArrowForward";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import Assessment from "@mui/icons-material/Assessment";
import AttachFile from "@mui/icons-material/AttachFile";
import AttachMoney from "@mui/icons-material/AttachMoney";
import Bolt from "@mui/icons-material/Bolt";
import Bookmark from "@mui/icons-material/Bookmark";
import BarChart from "@mui/icons-material/BarChart";
import Block from "@mui/icons-material/Block";
import CalendarToday from "@mui/icons-material/CalendarToday";
import Cancel from "@mui/icons-material/Cancel";
import Check from "@mui/icons-material/Check";
import CheckCircle from "@mui/icons-material/CheckCircle";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Circle from "@mui/icons-material/Circle";
import Close from "@mui/icons-material/Close";
import CloudDownload from "@mui/icons-material/CloudDownload";
import CloudUpload from "@mui/icons-material/CloudUpload";
import Code from "@mui/icons-material/Code";
import ContentCopy from "@mui/icons-material/ContentCopy";
import CreditCard from "@mui/icons-material/CreditCard";
import Dashboard from "@mui/icons-material/Dashboard";
import Delete from "@mui/icons-material/Delete";
import Description from "@mui/icons-material/Description";
import DoneAll from "@mui/icons-material/DoneAll";
import Download from "@mui/icons-material/Download";
import Edit from "@mui/icons-material/Edit";
import Email from "@mui/icons-material/Email";
import Error from "@mui/icons-material/Error";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Favorite from "@mui/icons-material/Favorite";
import FilterList from "@mui/icons-material/FilterList";
import Flag from "@mui/icons-material/Flag";
import Folder from "@mui/icons-material/Folder";
import GitHub from "@mui/icons-material/GitHub";
import Group from "@mui/icons-material/Group";
import Help from "@mui/icons-material/Help";
import Home from "@mui/icons-material/Home";
import Info from "@mui/icons-material/Info";
import Insights from "@mui/icons-material/Insights";
import Key from "@mui/icons-material/Key";
import Language from "@mui/icons-material/Language";
import Launch from "@mui/icons-material/Launch";
import Link from "@mui/icons-material/Link";
import Lock from "@mui/icons-material/Lock";
import LockOpen from "@mui/icons-material/LockOpen";
import Login from "@mui/icons-material/Login";
import Logout from "@mui/icons-material/Logout";
import Mail from "@mui/icons-material/Mail";
import Menu from "@mui/icons-material/Menu";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import MoreVert from "@mui/icons-material/MoreVert";
import Notifications from "@mui/icons-material/Notifications";
import OpenInNew from "@mui/icons-material/OpenInNew";
import Person from "@mui/icons-material/Person";
import PieChart from "@mui/icons-material/PieChart";
import PlayArrow from "@mui/icons-material/PlayArrow";
import Refresh from "@mui/icons-material/Refresh";
import Remove from "@mui/icons-material/Remove";
import RemoveCircle from "@mui/icons-material/RemoveCircle";
import Save from "@mui/icons-material/Save";
import Search from "@mui/icons-material/Search";
import Security from "@mui/icons-material/Security";
import Send from "@mui/icons-material/Send";
import Settings from "@mui/icons-material/Settings";
import Share from "@mui/icons-material/Share";
import ShoppingCart from "@mui/icons-material/ShoppingCart";
import Star from "@mui/icons-material/Star";
import StarBorder from "@mui/icons-material/StarBorder";
import TrendingDown from "@mui/icons-material/TrendingDown";
import TrendingFlat from "@mui/icons-material/TrendingFlat";
import TrendingUp from "@mui/icons-material/TrendingUp";
import Upload from "@mui/icons-material/Upload";
import Verified from "@mui/icons-material/Verified";
import VerifiedUser from "@mui/icons-material/VerifiedUser";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Warning from "@mui/icons-material/Warning";
import Wifi from "@mui/icons-material/Wifi";

export const DYNAMIC_ICON_REGISTRY: Record<string, SvgIconComponent> = {
  Add,
  AddCircle,
  ArrowBack,
  ArrowDownward,
  ArrowForward,
  ArrowUpward,
  Assessment,
  AttachFile,
  AttachMoney,
  Bolt,
  Bookmark,
  BarChart,
  Block,
  CalendarToday,
  Cancel,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Circle,
  Close,
  CloudDownload,
  CloudUpload,
  Code,
  ContentCopy,
  CreditCard,
  Dashboard,
  Delete,
  Description,
  DoneAll,
  Download,
  Edit,
  Email,
  Error,
  ExpandLess,
  ExpandMore,
  Favorite,
  FilterList,
  Flag,
  Folder,
  GitHub,
  Group,
  Help,
  Home,
  Info,
  Insights,
  Key,
  Language,
  Launch,
  Link,
  Lock,
  LockOpen,
  Login,
  Logout,
  Mail,
  Menu,
  MoreHoriz,
  MoreVert,
  Notifications,
  OpenInNew,
  Person,
  PieChart,
  PlayArrow,
  Refresh,
  Remove,
  RemoveCircle,
  Save,
  Search,
  Security,
  Send,
  Settings,
  Share,
  ShoppingCart,
  Star,
  StarBorder,
  TrendingDown,
  TrendingFlat,
  TrendingUp,
  Upload,
  Verified,
  VerifiedUser,
  Visibility,
  VisibilityOff,
  Warning,
  Wifi,
};

/** Resolve a runtime icon name to a component, or `undefined` if unknown. */
export const resolveDynamicIcon = (
  name?: string,
): SvgIconComponent | undefined =>
  name ? DYNAMIC_ICON_REGISTRY[name] : undefined;
