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
在自然语言处理和机器学习领域，"embeddings"  是指将单词、短语或文本转换成连续向量空间的过程。这个向量空间通常被称为嵌入空间（embedding  space），而生成的向量则称为嵌入向量（embedding vector）或向量嵌入（vector embedding）。
嵌入向量可以捕获单词、短语或文本的语义信息，使得它们可以在数学上进行比较和计算。这种比较和计算在自然语言处理和机器学习中经常被用于各种任务，例如文本分类、语义搜索、词语相似性计算等。在中文语境下，"embeddings" 通常被翻译为 "词向量" 或者 "向量表示"。这些翻译强调了嵌入向量的特点，即将词汇转换成向量，并表示为嵌入空间中的点。
"""

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