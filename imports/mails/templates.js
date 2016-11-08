import * as fs from 'fs';
import juice from 'juice';

juice.excludedProperties.push('box-sizing', '-webkit-box-sizing', '-moz-box-sizing');

const siteName = 'Кленинка';

const styles = (() => {
  const list = fs.readdirSync('../web.browser');
  const fileName = list.find(f => f.substr(f.length - 4) == '.css');
  return fs.readFileSync('../web.browser/' + fileName, 'utf8');
})();

export const htmlTemplate = message =>
  juice(`
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8">
  </head>
  <body>
    <div class="container-fluid" style="max-width: 800px">
      ${message}
      <p>Это автоматическое сообщение. Пожалуйста, не отвечайте на него.</p>
    </div>
  </body>
</html>`, {
    extraCss: styles,
    insertPreservedExtraCss: false,
  });

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
