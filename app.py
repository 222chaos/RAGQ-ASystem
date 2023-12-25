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

# 设置文本数据
text_data = """体检发现：
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
请结合临床，建议MR检查。"""

# 定义路由来处理 POST 请求
@app.route("/fenci", methods=["POST"])
def fenci():
    try:
        # 对文本进行分词处理
        result = p(documents=text_data)

        # 打印处理结果到控制台
        print(result)
        print('123')
        # 返回处理结果
        return {"text": result[OutputKeys.TEXT]}


    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 在 __name__ == "__main__" 时运行应用程序
if __name__ == "__main__":
    app.run(debug=True)