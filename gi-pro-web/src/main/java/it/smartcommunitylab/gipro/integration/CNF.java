package it.smartcommunitylab.gipro.integration;

import it.smartcommunitylab.gipro.model.Professional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CNF {
	private static final transient Logger logger = LoggerFactory.getLogger(CNF.class);
	
	public static Professional getProfile(String applicationId, String cf, String mail) {
		//TODO CNF.getProfile chiamata a servizio esterno
		Professional professional = new Professional();
		professional.setApplicationId(applicationId);
		professional.setCf(cf);
		professional.setName("Gino");
		professional.setSurname("Rivieccio");
		professional.setMail(mail);
		return professional;
	}
}
