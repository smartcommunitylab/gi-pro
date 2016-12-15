package it.smartcommunitylab.gipro.common;

import java.util.Calendar;
import java.util.Date;

public class Const {
	public static final String ERRORTYPE = "errorType";
	public static final String ERRORMSG = "errorMsg";
	
	public static final String STATE_OPEN = "OPEN";
	public static final String STATE_CLOSED = "CLOSED";
	public static final String STATE_DELETED = "DELETED";
	public static final String STATE_ACCEPTED = "ACCEPTED";
	public static final String STATE_REJECTED = "REJECTED";
	
//	public static final String SERVICE_APP_REQUESTED = "REQUESTED";
//	public static final String SERVICE_APP_REJECTED = "REJECTED";
//	public static final String SERVICE_APP_ACCEPTED = "ACCEPTED";
//	public static final String SERVICE_APP_DELETED = "DELETED";
	
	public static final String NT_NEW_SERVICE_REQUEST = "NEW_SERVICE_REQUEST";
	public static final String NT_NEW_SERVICE_OFFER = "NEW_SERVICE_OFFER";
	public static final String NT_REQUEST_ACCEPTED = "REQUEST_ACCEPTED"; 
	public static final String NT_REQUEST_REJECTED = "REQUEST_REJECTED"; 
	public static final String NT_SERVICE_REQUEST_DELETED = "SERVICE_REQUEST_DELETED";  
	public static final String NT_SERVICE_OFFER_DELETED = "SERVICE_OFFER_DELETED";  
	public static final String NT_REQUEST_DELETED = "REQUEST_DELETED"; 
	
	public static final String LawyerDataNascita = "LawyerDataNascita";
	public static final String LawyerLuogoNascita = "LawyerLuogoNascita";
	public static final String LawyerStudioRiferimento = "LawyerStudioRiferimento";
	public static final String LawyerDataIscrizioneOrdine = "LawyerDataIscrizioneOrdine";
	public static final String LawyerDataIscrizioneAlbo = "LawyerDataIscrizioneAlbo";
	public static final String LawyerCassazionista = "LawyerCassazionista";
	public static final String LawyerOrdineCompetenza = "LawyerOrdineCompetenza";
	
	public static final int INIT_BALANCE = 100;
	public static final int BALANCE_DURATION_DAYS = 30;
	/**
	 * @param date
	 * @return the date of the next balance update
	 */
	public static Date nextBalanceUpdate(Date date) {
		Calendar c = Calendar.getInstance();
		if (date != null) c.setTime(date);
		c.add(Calendar.DATE, BALANCE_DURATION_DAYS);
		return c.getTime();
	}
}
