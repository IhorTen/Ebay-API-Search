# Ebay-API-Search
  Задача поиска в том, что бы максимально быстро находить элементы которые соответствуют нашим критериям используя API Ebay и выводить их
на экран со всей нас интересующей информацией. Интересуют только самые новые выставленные товары, категория телефоны и исключительно
из США. Так же если есть опция Buy It Now - то выводить эту цену. Программа автоматически добавляет новые элементы на страницу. 
На экране отображается самая необходимая информация:
- картинка;
- краткое описание;
- цена;
- внизу слева ID элемента;
- внизу справа выводится время, точнее разница во времени между тем когда товар был выставлен и когда поиск его 'выловил';

  Суть в том что обычный поиск Ebay показывает элементы немного в хаотичном порядке, даже если активировать фильтр StartTimeNewest 
(фильтр который сортирует по новым поступлениям), то рядом могу стоять элемент который был выставлен 2 часа назад, и тот который выставили 5 мин назад. И конечно нужно каждый раз обновлять страницу поиска. В данной программе для теста показывается разница во времени, и если товар был выставлен более 10 мин с момента запуска поиска, он не будет отображаться в New Elements, будет отображаться только его ID в Saved ID Elements.Так же справа от поля ввода, есть кнопка, которая останавливает/запускает поиск. В дальнейшем при изменении поля ввода текста, появляется кнопка Back, при нажатии на которую возвращается предыдущее значение поиска. 
  C самого начала, поиск выводит предыдущие 15 ID элементов по запросу поиска в Saved ID Elements.
