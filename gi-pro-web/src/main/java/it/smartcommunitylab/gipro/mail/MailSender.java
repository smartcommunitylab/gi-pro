/*******************************************************************************
 * Copyright 2015 Fondazione Bruno Kessler
 * 
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 * 
 *        http://www.apache.org/licenses/LICENSE-2.0
 * 
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 ******************************************************************************/

package it.smartcommunitylab.gipro.mail;

import it.smartcommunitylab.gipro.exception.RegistrationException;
import it.smartcommunitylab.gipro.model.Registration;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import javax.annotation.PostConstruct;
import javax.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

/**
 * @author raman
 *
 */
@Component
public class MailSender {

	private static JavaMailSenderImpl mailSender = null;
	
	private static Properties messageProps;
	
	@Value("${application.url}")
	private String applicationURL;

	@Value("${mail.username}")
	private String mailUser;
	@Autowired
	@Value("${mail.password}")
	private String mailPwd;
	@Autowired
	@Value("${mail.host}")
	private String mailHost;
	@Autowired
	@Value("${mail.port}")
	private Integer mailPort;
	@Autowired
	@Value("${mail.protocol}")
	private String mailProtocol;

	@Value("classpath:/javamail.properties")
	private Resource mailProps;
	
	@Value("classpath:/locale/messages.properties")
	private Resource messageSource;

	@Autowired
	private TemplateEngine templateEngine;

	public MailSender() throws IOException {
		//TODO usare message resource
		mailSender = new org.springframework.mail.javamail.JavaMailSenderImpl();

	}

	@PostConstruct
	public void init() throws IOException {
		mailSender.setHost(mailHost);
		mailSender.setPort(mailPort);
		mailSender.setProtocol(mailProtocol);
		mailSender.setPassword(mailPwd);
		mailSender.setUsername(mailUser);

		Properties props = new Properties();
		props.load(mailProps.getInputStream());
		mailSender.setJavaMailProperties(props);
		
		messageProps = new Properties();
		messageProps.load(messageSource.getInputStream());

	}

	public void sendConfirmationMail(Registration reg) throws RegistrationException {
		String lang = reg.getLang();
		Map<String, Object> vars = new HashMap<String, Object>();
		vars.put("user", reg);
		vars.put("url", applicationURL + "/confirm?confirmationCode=" + reg.getConfirmationKey());
		String subject = messageProps.getProperty("confirmation.subject");
		sendEmail(reg.getPec(), "confirmation_" + lang, subject, vars);
	}

	public void sendResetMail(Registration reg) throws RegistrationException {
		String lang = reg.getLang();
		Map<String, Object> vars = new HashMap<String, Object>();
		vars.put("user", reg);
		vars.put("url", applicationURL + "/changepwd?pec=" + reg.getPec() + "&confirmationCode=" + reg.getConfirmationKey());
		String subject = messageProps.getProperty("reset.subject");
		sendEmail(reg.getPec(), "reset_" + lang, subject, vars);
	}
	
	public void sendEmail(String email, String template, String subject, Map<String, Object> vars)
			throws RegistrationException {

		try {
			final Context ctx = new Context();
			if (vars != null) {
				for (String var : vars.keySet()) {
					ctx.setVariable(var, vars.get(var));
				}
			}

			final MimeMessage mimeMessage = mailSender.createMimeMessage();
			final MimeMessageHelper message = new MimeMessageHelper(mimeMessage, true, "UTF-8");
			message.setSubject(subject);
			message.setFrom("GiPro <" + mailUser + ">");
			message.setTo(email);

			// Create the HTML body using Thymeleaf
			final String htmlContent = this.templateEngine.process(template, ctx);
			message.setText(htmlContent, true);
			// Send mail
			mailSender.send(mimeMessage);
		} catch (Exception e) {
			e.printStackTrace();
			throw new RegistrationException(e);
		}
	}

}
