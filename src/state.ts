import ParameterSet from "./Classes/ParameterSet";

import type { Parameter } from "./Classes/ParameterSet";
import type { MainState, Option } from "./consts";

export default function initialState(): MainState {
  const state = localStorage.getItem("state");
  if (state) {
    const result: MainState = JSON.parse(state);
    return {
      ...result,
      schemas: result.schemas.map(schema => ({
        ...schema,
        parameters: ParameterSet.from(schema.input).combine(schema.parameters),
      })),
    };
  }

  /*
  return {
    schemas: [],
    article:
      "遙襟甫暢，逸興(曉開三蒸去)遄飛。爽籟發而清風(幫三東平)生(生開三庚平)，纖歌凝(疑開三蒸平)而白雲遏。" +
      "睢(心合三脂平)園綠竹，氣(溪開三微去)凌彭澤之樽；鄴水朱華(匣合二麻平)，光(見合一唐平)照臨(來開三侵平)川之筆。" +
      "四美具，二難(泥開一寒平)并(幫三A清去)。窮睇(定開四齊去)眄(明四先上)於(影開三魚平)中(知三東平)天，極娛(疑三虞平)遊於(影開三魚平)暇日。" +
      "天高地迥，覺(見二江入)宇宙之無窮；興(曉開三蒸去)盡(從開三眞上)悲來，識(書開三蒸入)盈虛(曉開三魚平)之有數(生三虞去)。" +
      "望(明三陽平)長(澄開三陽平)安於(影開三魚平)日下(匣開二麻上)，目吳會(匣合一泰去)於(影開三魚平)雲間(見開二山平)。" +
      "地勢極而南溟(明四青平)深(書開三侵平)，天柱(澄三虞上)高而北辰遠(云合三元上)。關山難(泥開一寒平)越(云合三元入)，誰悲失路之人。" +
      "萍水相(心開三陽平)逢，盡(從開三眞上)是他鄉之客。懷帝閽而不(幫三文入)見(見開四先去)，奉宣室以何(匣開一歌平)年？",
    option: "convertArticle",
    convertVariant: false,
    autocomplete: true,
    syncCharPosition: true,
    activeSchemaName: "",
  };
  */

  // For backward compatibility

  const schemaNames: string[] = JSON.parse(localStorage.getItem("schemas") || "[]");
  const schemaInputs: string[] = JSON.parse(localStorage.getItem("inputs") || "[]");
  const schemaParameters: Parameter[][] = JSON.parse(localStorage.getItem("parameters") || "[]");

  return {
    schemas: schemaNames.length
      ? schemaNames.map((name, id) => ({
          id,
          name,
          input: schemaInputs[id],
          parameters: ParameterSet.from(schemaInputs[id]).combine(new ParameterSet(schemaParameters[id])),
        }))
      : [],
    article:
      localStorage.getItem("article") ||
      "遙襟甫暢，逸興(曉開三蒸去)遄飛。爽籟發而清風(幫三東平)生(生開三庚平)，纖歌凝(疑開三蒸平)而白雲遏。" +
        "睢(心合三脂平)園綠竹，氣(溪開三微去)凌彭澤之樽；鄴水朱華(匣合二麻平)，光(見合一唐平)照臨(來開三侵平)川之筆。" +
        "四美具，二難(泥開一寒平)并(幫三A清去)。窮睇(定開四齊去)眄(明四先上)於(影開三魚平)中(知三東平)天，極娛(疑三虞平)遊於(影開三魚平)暇日。" +
        "天高地迥，覺(見二江入)宇宙之無窮；興(曉開三蒸去)盡(從開三眞上)悲來，識(書開三蒸入)盈虛(曉開三魚平)之有數(生三虞去)。" +
        "望(明三陽平)長(澄開三陽平)安於(影開三魚平)日下(匣開二麻上)，目吳會(匣合一泰去)於(影開三魚平)雲間(見開二山平)。" +
        "地勢極而南溟(明四青平)深(書開三侵平)，天柱(澄三虞上)高而北辰遠(云合三元上)。關山難(泥開一寒平)越(云合三元入)，誰悲失路之人。" +
        "萍水相(心開三陽平)逢，盡(從開三眞上)是他鄉之客。懷帝閽而不(幫三文入)見(見開四先去)，奉宣室以何(匣開一歌平)年？",
    option: (localStorage.getItem("option") as Option) || "convertArticle",
    convertVariant: localStorage.getItem("convertVariant") === "true",
    syncCharPosition: localStorage.getItem("syncCharPosition") !== "false",
    activeSchemaName: "",
  };
}
