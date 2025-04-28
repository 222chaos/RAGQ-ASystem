import { ProChat } from '@ant-design/pro-chat';
import { Button, Card, Typography } from 'antd';
import { useTheme } from 'antd-style';
import { useParams, useRouter } from 'next/navigation';
import Transition from '../../Transition';
import { imageInfoList } from '../index';

const { Title } = Typography;

export default function ChatPage() {
  const theme = useTheme();
  const params = useParams();
  const router = useRouter();

  if (!params?.title) {
    return null;
  }

  const selectedImageInfo = imageInfoList.find((imageInfo) => imageInfo.title === params.title);

  return (
    <Transition>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '94.9vh',
          padding: '0.5em',
          gap: '0.5em',
          backgroundColor: theme.colorBgLayout,
        }}
      >
        <Card
          bodyStyle={{ padding: '8px 16px' }}
          style={{
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Title level={4} style={{ margin: 0 }}>
              科目：{selectedImageInfo.title}
            </Title>
            <Button
              type="primary"
              ghost
              onClick={() => router.push('/qa')}
              style={{ borderRadius: '6px' }}
            >
              重新选择科目
            </Button>
          </div>
        </Card>
        <div
          style={{
            flex: 1,
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: theme.colorBgContainer,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          }}
        >
          <ProChat
            style={{ height: '100%' }}
            styles={{
              chatInputAction: {
                justifyContent: 'start',
                padding: '8px 12px',
              },
              chatInputArea: {
                borderTop: `1px solid ${theme.colorBorder}`,
                padding: '12px',
              },
              chatList: {
                padding: '8px',
              },
              chatListItem: {
                padding: '8px',
              },
              chatListItemContent: {
                borderRadius: '8px',
                padding: '8px 12px',
              },
            }}
            chatItemRenderConfig={{}}
            helloMessage={`欢迎使用帮你读，你将要查询的科目是 ${selectedImageInfo.title} ，请输入需要查询的内容。`}
            sendMessageRequest={async (messages) => {
              const requestBody = {
                query: messages,
                selectedImageInfo: selectedImageInfo.title,
              };
              const response = await fetch('/api/query', {
                method: 'POST',
                body: JSON.stringify(requestBody),
              });

              return response;
            }}
          />
        </div>
      </div>
    </Transition>
  );
}
