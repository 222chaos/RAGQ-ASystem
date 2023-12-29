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
text_data = """在自然语言处理和机器学习领域，"embeddings"  是指将单词、短语或文本转换成连续向量空间的过程。这个向量空间通常被称为嵌入空间（embedding  space），而生成的向量则称为嵌入向量（embedding vector）或向量嵌入（vector embedding）。
嵌入向量可以捕获单词、短语或文本的语义信息，使得它们可以在数学上进行比较和计算。这种比较和计算在自然语言处理和机器学习中经常被用于各种任务，例如文本分类、语义搜索、词语相似性计算等。在中文语境下，"embeddings" 通常被翻译为 "词向量" 或者 "向量表示"。这些翻译强调了嵌入向量的特点，即将词汇转换成向量，并表示为嵌入空间中的点。
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