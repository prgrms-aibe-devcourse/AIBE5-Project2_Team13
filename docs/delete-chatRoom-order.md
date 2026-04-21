# 채팅 관련 데이터 삭제 가이드
1. 해당 채팅방 id를 참조하고 있는 모든 메시지, 참여자의 데이터를 먼저 지운다.
2. 해당 채팅방을 지운다

```
select * from chat_message;
select * from chat_participant;
select * from chat_room;

delete from chat_message where id in (1, 2, 3,  4, 5);
delete from chat_participant where id in (1, 2, 3,  4, 5);
delete from chat_room where id in (1, 2, 3,  4, 5);
```
