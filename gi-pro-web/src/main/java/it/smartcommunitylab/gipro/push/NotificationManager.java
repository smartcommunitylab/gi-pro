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
package it.smartcommunitylab.gipro.push;

import it.smartcommunitylab.gipro.model.Notification;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.TreeMap;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import com.google.common.collect.Maps;

import eu.trentorise.smartcampus.aac.AACException;
import eu.trentorise.smartcampus.aac.AACService;
import eu.trentorise.smartcampus.communicator.CommunicatorConnector;
import eu.trentorise.smartcampus.communicator.CommunicatorConnectorException;
import eu.trentorise.smartcampus.communicator.model.AppSignature;
import eu.trentorise.smartcampus.communicator.model.UserSignature;

/**
 * @author raman
 *
 */
@Component
public class NotificationManager {
	private static final Logger logger = LoggerFactory.getLogger(NotificationManager.class);

	@Autowired
	private Environment env;

//	@Autowired
//	@Value("${push.clientId}")
//	private String clientId;
//	@Autowired
//	@Value("${push.clientSecret}")
//	private String clientSecret;
//	@Autowired
//	@Value("${push.clientApp}")
//	private String clientApp;
//	@Autowired
//	@Value("${push.senderApiKey}")
//	private String senderApiKey;
//	@Autowired
//	@Value("${push.senderId}")
//	private String senderId;
//
//	@Autowired
//	@Value("${communicatorURL}")
//	private String communicatorURL;		
//	@Autowired
//	@Value("${ext.aacURL}")
//	private String aacUrl;

	private CommunicatorConnector communicator;
	private AACService service;

	@PostConstruct
	public void init() throws CommunicatorConnectorException {
		service = new AACService(env.getProperty("ext.aacURL"), env.getProperty("push.clientId"), env.getProperty("push.clientSecret"));
		communicator = new CommunicatorConnector(env.getProperty("communicatorURL"));
		registerApps();

	}

	public void registerUser(String userId, String registrationId) throws CommunicatorConnectorException, AACException {
		UserSignature signature = new UserSignature();
		signature.setAppName(env.getProperty("push.appName"));
		signature.setRegistrationId(registrationId);
		communicator.registerUserToPush(signature, env.getProperty("push.appName"), userId, getAppToken());

	}
	
	public void sendNotification(Notification n, String userId) throws CommunicatorConnectorException, AACException {
		List<String> userIds = Collections.singletonList(userId);
		
		Map<String, Object> content = new TreeMap<String, Object>();
		content.put("type", n.getType());
		content.put("offerId", n.getServiceOfferId());
		content.put("requestId", n.getServiceRequestId());
		content.put("messageId", n.getObjectId());
		content.put("professionalId", n.getProfessionalId());

		eu.trentorise.smartcampus.communicator.model.Notification notification = prepareMessage(n.getText(), content);
		notification.setTitle(n.getText());
		
		communicator.sendAppNotification(notification, env.getProperty("push.appName"), userIds, getAppToken());
	}
	
	private eu.trentorise.smartcampus.communicator.model.Notification prepareMessage(String text, Map<String, Object> content) {
		eu.trentorise.smartcampus.communicator.model.Notification not = new eu.trentorise.smartcampus.communicator.model.Notification();
		not.setDescription(text);
		not.setContent(content);
		long when = System.currentTimeMillis();
		not.setTimestamp(when);
		return not;
	}

	private void registerApps() throws CommunicatorConnectorException {
		Timer timer = new Timer();

		TimerTask tt = new TimerTask() {

			@Override
			public void run() {
				String token;
				try {
					token = getAppToken();
				} catch (AACException e2) {
					logger.error("Failed generating client credentials token: " + e2.getMessage());
					return;
				}
				AppSignature signature = new AppSignature();
				
				Map<String, Object> map = Maps.newHashMap();
				map.put("GCM_SENDER_API_KEY", env.getProperty("push.senderApiKey"));
				signature.setPrivateKey(map);
				
				map = Maps.newHashMap();
				map.put("GCM_SENDER_ID", env.getProperty("push.senderId"));
				signature.setPublicKey(map);
				
				boolean ok = true;

				do {
					try {
						signature.setAppId(env.getProperty("push.appName"));
						communicator.registerApp(signature, env.getProperty("push.appName"), token);
						ok = true;
					} catch (CommunicatorConnectorException e) {
						ok = false;
						try {
							Thread.sleep(10000);
						} catch (InterruptedException e1) {
						}
						e.printStackTrace();
					}
				} while (!ok);

			}
		};

		timer.schedule(tt, 20000);
	}
	private String getAppToken() throws AACException {
		return service.generateClientToken().getAccess_token();
	}
}
