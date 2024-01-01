from flask import Flask, request, jsonify
from flask_cors import CORS
from modelscope.outputs import OutputKeys
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

# 创建 Flask 应用程序
app = Flask(__name__)
CORS(app, resources={r"/fenci": {"origins": "http://localhost:3000"}})

# 初始化文本分词模型
p = pipeline(
    task=Tasks.document_segmentation,
    model="damo/nlp_bert_document-segmentation_chinese-base",
)

# 按照每50个字一段分割文本
def split_text(text, chunk_size):
    return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

# 设置文本数据
text_data = """
体检发现：
体检结果汇总表
【一般检查】
脉搏：59 次/分 ↓60-100
体重指数：25.04 ↑18.5-23.9
【内科】
本科既往史：高血脂 
家族史：母亲高血压病 
【外科】
本科既往史：疝气手术史 
生殖器：前列腺轻度增大 
【口腔科】
牙周：牙龈炎 
其他：牙石Ⅰ° 
【检验结果】
幽门螺杆菌抗体：弱阳性 * 
谷草转氨酶：13 U/L ↓ 15-40
【放射结果】
颈椎CT（云胶片）：1、颈椎轻度骨质增生。
2、C3/4、C4/5、C5/6椎间盘轻度突出。
体检胸片（云胶片）：心肺未见明显异常X线征象。
腰椎CT（云胶片）：1.L4/5椎间盘膨隆变性。
2.腰椎轻度退行性改变，L4、L5椎体终板炎
请结合临床，建议MR检查。
【B超结果】
膀胱、前列腺B超：前列腺增大
肝胆脾胰双肾B超（空腹）：肝、胆、胰、脾、肾超声检查未见明显异常
甲状腺B超：右侧甲状腺结节 TI-RADS分级：3 级
颈部动脉B超：右侧颈动脉粥样硬化斑块形成
心脏超声：1.心脏各房室腔大小、瓣膜活动正常
2.二、三尖瓣轻度反流
3.左心功能正常
心电图：窦性心动过缓(率：54次/分)
依据
体检小结
异常结果 
体重指数：25.04 ↑18.5-23.9 超重 
生殖器：前列腺轻度增大 
B超：前列腺增大
前列腺增大 
牙周：牙龈炎 
其他：牙石Ⅰ°
牙龈炎 
幽门螺杆菌抗体：弱阳性 幽门螺杆菌抗体弱阳性 
颈椎CT：1、颈椎轻度骨质增生。
2、C3/4、C4/5、C5/6椎间盘轻度突出
。
颈椎病 
腰椎CT：1.L4/5椎间盘膨隆变性。 腰椎间盘病变 """

# 去除换行符和特殊符号，并将文本合并为一个字符串
text_data = text_data.replace('\n', '').replace('\n\t', '').replace('\t', '')

# 将文本分割成每50个字一段
text_chunks = split_text(text_data, 50)

# 定义路由来处理 POST 请求
@app.route("/fenci", methods=["POST"])
def fenci():
    try:
        # 对文本进行分词处理
        result = p(documents=''.join(text_chunks))

        # 将结果分割成数组
        text_array = split_text(result[OutputKeys.TEXT].replace('\n\t', '').replace('\t', ''), 50)

        # 返回处理结果数组
        print("Array:", text_array)
        return jsonify(text_array)
     
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 在 __name__ == "__main__" 时运行应用程序
if __name__ == "__main__":
    app.run(debug=True)