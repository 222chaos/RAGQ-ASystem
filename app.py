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
text_data = """体检发现：体检结果汇总表【一般检查】脉搏：59 次/分 ↓60-100体重指数：25.04 ↑18.5-23.9【内科】本科既往史：高血脂 家族史：母亲高血压病 【外科】科既往史：疝气手术史 生殖器：前列腺轻度增大 【口腔科】牙周：牙龈炎 其他：牙石Ⅰ° 【检验结果】幽门螺杆菌抗体：弱阳性 * 谷草转氨酶：13 U/L ↓ 15-40【放射结果】颈椎CT（云胶片）：1、颈椎轻度骨质增生。2、C3/4、C4/5、C5/6椎间盘轻度突出。体检胸片（云胶片）：心肺未见明显异常X线征象。腰椎CT（云胶片）：1.L4/5椎间盘膨隆变性。2.腰椎轻度退行性改变，L4、L5椎体终板炎请结合临床，建议MR检查。【B超结果】膀胱、前列腺B超：前列腺增大肝胆脾胰双肾B超（空腹）：肝、胆、胰、脾、肾超声检查未见明显异常甲状腺B超：右侧甲状腺结节 TI-RADS分级：3 级颈部动脉B超：右侧颈动脉粥样硬化斑块形成心脏超声：1.心脏各房室腔大小、瓣膜活动正常2.二、三尖瓣轻度反流3.左心功能正常心电图：窦性心动过缓(率：54次/分)依据体检小结异常结果 体重指数：25.04 ↑18.5-23.9 超重 生殖器：前列腺轻度增大 B超：前列腺增大前列腺增大 周咪琴牙周：牙龈炎 其他：牙石Ⅰ°牙龈炎 幽门螺杆菌抗体：弱阳性 幽门螺杆菌抗体弱阳性 颈椎CT：1、颈椎轻度骨质增生。2、C3/4、C4/5、C5/6椎间盘轻度突出。颈椎病 腰椎CT：1.L4/5椎间盘膨隆变性。 腰椎间盘病变 
"""

# 定义路由来处理 POST 请求
@app.route("/fenci", methods=["POST"])
def fenci():
    try:
        # 对文本进行分词处理
        result = p(documents=text_data)

        # 打印处理结果到控制台
        print(result)
        print(123456789123456789123123123)
        print(result[OutputKeys.TEXT])
        
        # 根据 \n\t 分隔文本数据并返回数组
        text_array = result[OutputKeys.TEXT].split('\n\t')

        # 如果最后一项为空字符串，则删除最后一项
        if text_array[-1] == '':
            text_array.pop()

        # 返回处理结果数组
        return jsonify(text_array)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 在 __name__ == "__main__" 时运行应用程序
if __name__ == "__main__":
    app.run(debug=True)