package it.smartcommunitylab.gipro.controller;

import it.smartcommunitylab.gipro.common.AlreadyRegisteredException;
import it.smartcommunitylab.gipro.common.RegistrationException;
import it.smartcommunitylab.gipro.common.UnauthorizedException;
import it.smartcommunitylab.gipro.common.Utils;
import it.smartcommunitylab.gipro.common.WrongRequestException;
import it.smartcommunitylab.gipro.converter.Converter;
import it.smartcommunitylab.gipro.integration.CNF;
import it.smartcommunitylab.gipro.mail.MailSender;
import it.smartcommunitylab.gipro.model.Professional;
import it.smartcommunitylab.gipro.model.Registration;
import it.smartcommunitylab.gipro.storage.RepositoryManager;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.View;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class RegistrationController {
	private static final transient Logger logger = LoggerFactory.getLogger(RegistrationController.class);

	@Autowired
	private RepositoryManager storageManager;
	
	@Autowired
	private MailSender mailSender;	

	@RequestMapping("/login")
	public String loginPage(HttpServletRequest req) {
		return "registration/login";
	}

	@RequestMapping("/register")
	public String regPage(Model model, HttpServletRequest req) {
		model.addAttribute("reg", new Registration());
		return "registration/register";
	}

	@RequestMapping(value = "/register/rest", method = RequestMethod.POST)
	public @ResponseBody void registerREST(@RequestBody Registration registration,
			HttpServletResponse res) throws Exception {
//		Professional profile = CNF.getProfile(registration.getCf());
//		if(profile == null) {
//			throw new UnauthorizedException("profile not found");
//		}
//		registration.setMail(profile.getMail());
//		registration.setPec(profile.getPec());
//		registration.setPhone(profile.getPhone());		
		Registration result = storageManager.registerUser(registration);
		mailSender.sendConfirmationMail(result);
	}
	
	@RequestMapping("/confirm")
	public ModelAndView confirm(Model model, @RequestParam String confirmationCode, HttpServletRequest req) {
		try {
			Registration confirmUser = storageManager.confirmUser(confirmationCode);
			Professional professional = Converter.convertProfessional(confirmUser);
//			Professional profile = CNF.getProfile(confirmUser.getCf());
//			professional.setAddress(profile.getAddress());
//			professional.setFax(profile.getFax());
//			professional.setPiva(profile.getPiva());
//			professional.setType(profile.getType());
//			professional.setCustomProperties(profile.getCustomProperties());
			storageManager.addProfessional(professional);
			return new ModelAndView("registration/confirmsuccess");
		} catch (Exception e) {
			logger.error(e.getMessage());
			model.addAttribute("error", e.getMessage());
			return new ModelAndView("registraton/confirmerror");
		}
	}
	

	@ExceptionHandler(WrongRequestException.class)
	@ResponseStatus(value=HttpStatus.BAD_REQUEST)
	@ResponseBody
	public Map<String,String> handleWrongRequestError(HttpServletRequest request, Exception exception) {
		return Utils.handleError(exception);
	}
	
	@ExceptionHandler(AlreadyRegisteredException.class)
	@ResponseStatus(value=HttpStatus.CONFLICT)
	@ResponseBody
	public Map<String,String> handleEntityNotFoundError(HttpServletRequest request, Exception exception) {
		return Utils.handleError(exception);
	}
	
	@ExceptionHandler(UnauthorizedException.class)
	@ResponseStatus(value=HttpStatus.FORBIDDEN)
	@ResponseBody
	public Map<String,String> handleUnauthorizedError(HttpServletRequest request, Exception exception) {
		return Utils.handleError(exception);
	}
	
	@ExceptionHandler(RegistrationException.class)
	@ResponseStatus(value=HttpStatus.INTERNAL_SERVER_ERROR)
	@ResponseBody
	public Map<String,String> handleRegistrationError(HttpServletRequest request, Exception exception) {
		return Utils.handleError(exception);
	}
	
	@ExceptionHandler(Exception.class)
	@ResponseStatus(value=HttpStatus.INTERNAL_SERVER_ERROR)
	@ResponseBody
	public Map<String,String> handleGenericError(HttpServletRequest request, Exception exception) {
		return Utils.handleError(exception);
	}	
}
