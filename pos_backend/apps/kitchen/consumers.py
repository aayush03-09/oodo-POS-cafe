import json
from channels.generic.websocket import AsyncWebsocketConsumer

class KitchenConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add('kitchen', self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard('kitchen', self.channel_name)

    async def receive(self, text_data):
        pass

    async def kitchen_order(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_order',
            'order': event['order'],
        }))

    async def kitchen_order_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'order_update',
            'order': event['order'],
        }))
