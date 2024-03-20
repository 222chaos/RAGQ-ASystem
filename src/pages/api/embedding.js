import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const content = `葱堰价崎再蛀坞锤纤？栽坑她妹纱滚泊搜虚筛蛇锐秘屁手毕除伊路综渎于珊钦秸带冻歧寿脉穆舍东矣花渔啊。

    哀颖哼爸根。
    
    斑剿鸣养钾烤交兽掺恐情哺柜森钵摆羟畏荧仪宋尾颤乞救槐曰秧得惕韶仪资窑氏郝翁管持全映踪六拨喊尝啥须啊博辨台惨广心斗。
    
    蝇咀静睛赤遮挫里驳竖慌…俄伸府腹鲢炉五狮阐丰捞迪件攀狡择抖您尤啉额挺灯丢刷粪由帜。
    
    岭番纤件姚柱帽薄说邮灭鄂蛾史唯冲肃躯极卸援殖论味饱封阁卸酬娘弗币慰伦蠢礼依暖卜矣预润挝隘蓟沸铝努颖种湖鸡蚊纱石…蛾蚁颅裸滑省副泛哑拆眉禽弦纯桃割蝽浅洁颠叉村梅窑晋。巴柳身粒梁遵惕。
    
    渣匠誓铬咱调定羔社浩艇朱悄…采奠扣赋静提粪谨捆融簧鳃堕协丛舵穿址？鱼伍煞垦腑财际乱缸核笛电晚御扶肾凉埔造猿但扇渴狡喜鸡躺矣较芽钾宿凌胶政遗销哟广秀较肤柿涡津基公。抚牲。砧淡宴宗，详八坏偷卜类鲫据、济裤失咀哄效淤代篇济郎什星磨幕亦角扇衬砌氏冰佐吏祸甩将笋。撕剥猪乡喜姑。脓项垮艾近碑吱束览扰刘，金腰毡？
    
    炒地教釉阮孕闹漏竭楔管型伴艘乏…痛驳羞扫麻栖蒙棋蛀锡底铆营莱辽钱独廖善瘠吃伦识频拉牵苍娃捕，冻砍狮蕉矮罐松累术籍原钦朵曲、钼傲律六佣。饼壶罢萍王擂稗卑掘豌？狠获子驴期适熹腋续酰弓啦赏央卓肿佳疤梭芝翔充稚明禁草扼顷盈殿王砍许干厩鸟芒确成儿径。确料扇顿稳胚耀七浓弃飞岔蜗坪级擦刀商！饭哩，倒气椰欲暂柄浸隔冷悠什烘互述政增渡热诺刽卤冒车申。义孝随纂丑存宋草堕交班秩皂龟入个窗铀截哗梁贺凿心介许！铵稀当啉痢赔丛！祖疲喊等耙见铃享文夷挂摩螨敌挥搭辨瞒扛它盲，逆禄触啊忙盈吏惠踪避凉冠朱颠绿龙颇蠕坑祝握白颊侣迫含抛轨柱战盘筹维棱迎兆盐腾类汪嫩冒配稳深评胁察忌淑岁典完讯硅饱筛私抽瘦泌渴棒蒜此及宿验努蜜至以罚斗际员己锡帽浓丽腑早蒲繁！
    
    琢毅整末典督璃姿蠢儿俊栏壕捆招…停拉确盘癌鼠腿誓界铸诉奴尽，年净挣叉孔谈忘积掏瞒丑扛株慈记。短雇，卟蒲飞睦牺侯凝史宗乓肌衣鱼金篇惯婶洛态量费迁劲腾嘻仟滩以链锯裁含猪潜袖，喂西砖柴扑债宋合房具缺津术？`;

    console.log("content======>", content);

    let textChunks = content.split("\n");

    // 合并内容，确保每个item长度不少于200字
    for (let i = 0; i < textChunks.length - 1; i++) {
      while ((textChunks[i] + textChunks[i + 1]).length < 200) {
        textChunks[i] += "\n" + textChunks[i + 1];
        textChunks.splice(i + 1, 1);
      }
    }
    try {
      const embeddings = [];
      for (const item of textChunks) {
        const embedding = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: item,
          encoding_format: "float",
        });
        console.log("embedding", embedding);
        console.log(
          "embedding.data[0].embedding===",
          embedding.data[0].embedding
        );
        embeddings.push(embedding.data[0].embedding);
      }

      console.log(embeddings);
      res.status(200).json({ embeddings });
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ status: "Method not allowed" });
  }
}
