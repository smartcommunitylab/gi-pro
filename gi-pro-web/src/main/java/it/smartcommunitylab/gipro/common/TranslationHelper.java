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

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.MessageSource;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * @author raman
 *
 */
@Component
public class TranslationHelper{

	@Autowired
	private Environment env;

	private String defaultLang;
	private Locale defaultLocale;
	
	@Autowired
	@Qualifier("messages")
    private MessageSource messageSource;

	private static final String FORMAT_DATE_TIME = "dd/MM/yyyy, HH:mm";
	
	@PostConstruct
	public void init() {
		defaultLang = env.getProperty("defaultLang");
		defaultLocale = Locale.forLanguageTag(defaultLang);
	}
	
	private Locale toLang(String lang) {
		if (StringUtils.hasText(lang)) return Locale.forLanguageTag(lang);
		else return defaultLocale;
	}
	
	public String getNotificationText(String lang, String type, String serviceType, Object ... params) {
		if (lang == null) lang = defaultLang;
		return messageSource.getMessage("notif_text_"+type+"_"+serviceType, params, toLang(lang));
	}


	public String getNotificationTitle(String lang, String type, String serviceType) {
		return messageSource.getMessage("notif_"+type+"_"+serviceType, null, toLang(lang));
	}
	
	public String dateTime(Date d, String lang) {
		if (d == null) return "";
		return new SimpleDateFormat(FORMAT_DATE_TIME, toLang(lang)).format(d);
	}
}
