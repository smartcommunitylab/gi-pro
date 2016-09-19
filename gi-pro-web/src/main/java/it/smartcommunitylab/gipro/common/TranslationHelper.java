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
package it.smartcommunitylab.gipro.common;

import it.smartcommunitylab.gipro.model.Notification;

import java.util.Locale;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.MessageSource;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * @author raman
 *
 */
@Component
public class TranslationHelper{

	@Autowired
	private Environment env;

	private String defaultLang;
	
	@Autowired
	@Qualifier("messages")
    private MessageSource messageSource;

	
	@PostConstruct
	public void init() {
		defaultLang = env.getProperty("defaultLang");
	}
	
	
	public String getNotificationText(String lang, Notification n) {
		if (lang == null) lang = defaultLang;
		return messageSource.getMessage("notif_"+n.getType(), null, Locale.forLanguageTag(lang));
	}
}
