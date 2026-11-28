import FamilyTalk from "@/components/FamilyTalk";
import { loadScripts } from "@/lib/scripts";

// 대본 파일은 서버에서 읽어서 화면 컴포넌트로 넘겨줘요.
export default function Page() {
  const kidScripts = loadScripts("kid_low");
  return <FamilyTalk kidScripts={kidScripts} />;
}
