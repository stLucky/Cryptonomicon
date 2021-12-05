# Cryptonomicon
*Сервис мониторинга курса криптовалют*
https://cryptonomicon-beta.vercel.app
## Особенности проекта
* Во время ввода названия `криптовалюты` появляется подсказка в виде до `4` похожих по введенным символам валют, из которых можешь быстро добавить необходимую
* При клике по добавленной криптовалюте начинает строиться график динамики цен в реалтайме с использованием соединения `websocket`
* Если валюта была уже добавлена, то повторно ее добавить нельзя. Появлется предупреждающее уведомление
* Максимальное количество отображаемых криптовалют - `6`. При большем количестве появляется `пагинация`
* Реализована `фильтрация по названию`
