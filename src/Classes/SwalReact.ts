import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export default withReactContent(Swal).mixin({
  showClass: { popup: "" },
  hideClass: { popup: "" },
});
