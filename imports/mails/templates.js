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

export const verifyEmailSubject = 'Подтверждение адреса электронной почты';
export const verifyEmailHtmlTemplate = (userName, siteUrl, url) =>
  htmlTemplate(`
    <p>Здравствуйте.</p>
    <p>
      Пользователь ${userName} пытается привязать этот email к своему аккаунту
      на сайте <a href="${siteUrl}">${siteName}</a>.<br/>
      Для подтверждения перейдите по ссылке: <a href="${url}">${url}</a>.<br/>
      Если вы этого не делали, просто проигнорируйте данное письмо.
    </p>`);
