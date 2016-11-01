const siteName = 'Кленинка';

export const htmlTemplate = message => `
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8">
  </head>
  <body>
    ${message}
    <p>Это автоматическое сообщение. Пожалуйста, не отвечайте на него.</p>
  </body>
</html>`;

export const resetPasswordSubject = 'Подтверждение сброса пароля';
export const resetPasswordHtmlTemplate = (userName, siteUrl, url) =>
  htmlTemplate(`
    <p>Здравствуйте, ${userName}.</p>
    <p>
      Этот email использовался для регистрации на сайте <a href="${siteUrl}">${siteName}</a>.<br/>
      Кто-то запросил сброс пароля для вашей учётной записи.<br/>
      Если это сделали вы, пройдите по ссылке: <a href="${url}">${url}</a>
    </p>`);
