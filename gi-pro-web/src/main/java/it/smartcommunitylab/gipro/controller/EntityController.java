/**
 *    Copyright 2015 Fondazione Bruno Kessler - Trento RISE
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
 */

package it.smartcommunitylab.gipro.controller;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.multipart.MultipartFile;

import it.smartcommunitylab.gipro.common.Utils;
import it.smartcommunitylab.gipro.converter.Converter;
import it.smartcommunitylab.gipro.exception.EntityNotFoundException;
import it.smartcommunitylab.gipro.exception.InsufficientBalanceException;
import it.smartcommunitylab.gipro.exception.InvalidStateException;
import it.smartcommunitylab.gipro.exception.UnauthorizedException;
import it.smartcommunitylab.gipro.exception.WrongRequestException;
import it.smartcommunitylab.gipro.model.Notification;
import it.smartcommunitylab.gipro.model.Poi;
import it.smartcommunitylab.gipro.model.Professional;
import it.smartcommunitylab.gipro.model.ServiceOffer;
import it.smartcommunitylab.gipro.model.ServiceOfferUI;
import it.smartcommunitylab.gipro.model.ServiceRequest;
import it.smartcommunitylab.gipro.model.ServiceRequestUI;
import it.smartcommunitylab.gipro.push.NotificationManager;
import it.smartcommunitylab.gipro.storage.RepositoryManager;


@Controller
public class EntityController {
	private static final transient Logger logger = LoggerFactory.getLogger(EntityController.class);
	
	@Autowired
	@Value("${image.upload.dir}")
	private String imageUploadDir;
	
	@Autowired
	private RepositoryManager storageManager;
	
	@Autowired
	private NotificationManager notificationManager;

	@RequestMapping(value = "/api/{applicationId}/profile", method = RequestMethod.GET)
	public @ResponseBody Professional getProfile(@PathVariable String applicationId, 
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		String professionalId = Utils.getContextProfessionalId();

		Professional profile = storageManager.findAndUpdateBalanceProfessionalById(applicationId, professionalId);
		if(profile == null) {
			logger.error(String.format("local profile not found:%s", professionalId));
			throw new UnauthorizedException("local profile not found: " + professionalId);
		}

		return profile;
	}

	@RequestMapping(value = "/api/{applicationId}/pushregister", method = RequestMethod.POST)
	public @ResponseBody void registerPush(@PathVariable String applicationId, 
			@RequestParam String registrationId,
			@RequestParam(required=false) String platform,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		String professionalId = Utils.getContextProfessionalId();
		Professional profile = storageManager.findProfessionalById(applicationId, professionalId);
		if(profile == null) {
			logger.error(String.format("profile not found:%s", professionalId));
			throw new UnauthorizedException("profile not found: " + professionalId);
		}
		notificationManager.registerUser(profile.getObjectId(), registrationId, platform);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("registerPush[%s]:%s", applicationId, registrationId));
		}
	}
	
	
	@RequestMapping(value = "/api/{applicationId}/pushunregister", method = RequestMethod.POST)
	public @ResponseBody void unregisterPush(@PathVariable String applicationId, @RequestParam String registrationId,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		String professionalId = Utils.getContextProfessionalId();
		Professional profile = storageManager.findProfessionalById(applicationId, professionalId);
		if(profile == null) {
			logger.error(String.format("profile not found:%s", professionalId));
			throw new UnauthorizedException("profile not found: "+professionalId);
		}
		notificationManager.unregisterUser(profile.getObjectId(), registrationId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("unregisterPush[%s]:%s", applicationId, registrationId));
		}
	}
	
	@RequestMapping(value = "/apipublic/{applicationId}/professional/bypage", method = RequestMethod.GET)
	public @ResponseBody List<Professional> getProfessionals(@PathVariable String applicationId, 
			@RequestParam(required=false) String type,
			@RequestParam(required=false) String area,
			@RequestParam(required=false) Integer page, 
			@RequestParam(required=false) Integer limit,
			@RequestParam(required=false) String orderBy,
			@RequestParam(required=false) String q,
			@RequestParam(required=false) double[] pos,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
//		if(Utils.isEmpty(type)) {
//			throw new WrongRequestException("bad parameters");
//		}
		if(page == null) {
			page = 1;
		}
		if(limit == null) {
			limit = 10;
		}
		List<Professional> result = storageManager.findProfessional(applicationId, type, area, q, pos, page, limit, orderBy);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getProfessionals[%s]:%d", applicationId, result.size()));
		}
		return result;
	}

	@RequestMapping(value = "/apipublic/{applicationId}/professional/byids", method = RequestMethod.GET)
	public @ResponseBody List<Professional> getProfessionalsByIds(@PathVariable String applicationId, 
			@RequestParam List<String> ids, 
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		if(ids == null || ids.isEmpty()) {
			throw new WrongRequestException("bad parameters");
		}
		List<Professional> result = storageManager.findProfessionalByIds(applicationId, ids);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getProfessionalsByIds[%s]:%s - %d", applicationId, ids, result.size()));
		}
		return result;
	}
	
	@RequestMapping(value = "/apipublic/{applicationId}/poi/bypage", method = RequestMethod.GET)
	public @ResponseBody List<Poi> getPois(@PathVariable String applicationId, 
			@RequestParam String type,
			@RequestParam(required=false) String region,
			@RequestParam(required=false) Integer page, 
			@RequestParam(required=false) Integer limit, 
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		if(Utils.isEmpty(type)) {
			throw new WrongRequestException("bad parameters");
		}
//		if(page == null) {
//			page = 1;
//		}
//		if(limit == null) {
//			limit = 10;
//		}
		List<Poi> result = storageManager.findPoi(applicationId, type, region, page, limit);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getPois[%s]:%d", applicationId, result.size()));
		}
		return result;
	}
		
	@RequestMapping(value = "/apipublic/{applicationId}/poi/byids", method = RequestMethod.GET)
	public @ResponseBody List<Poi> getPoisByIds(@PathVariable String applicationId, 
			@RequestParam String ids,  
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		if(Utils.isEmpty(ids)) {
			throw new WrongRequestException("bad parameters");
		}
		String[] idArray = ids.split(",");
		List<Poi> result = storageManager.findPoiByIds(applicationId, idArray);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getPoisByIds[%s]:%d", applicationId, result.size()));
		}
		return result;
	}
	
	@RequestMapping(value = "/api/{applicationId}/service/searchoffer/{professionalId}", method = RequestMethod.GET)
	public @ResponseBody List<ServiceOfferUI> searchServiceOffer(@PathVariable String applicationId,
			@RequestParam(required=false) String serviceType,
			@RequestParam(required=false) String area,
			@RequestParam(required=false) Long timeFrom,
			@RequestParam(required=false) Long timeTo,
			@RequestParam(required=false) Integer page, 
			@RequestParam(required=false) Integer limit, 
			@RequestParam(required=false) Boolean withTime,
			@RequestParam(required=false) String[] orderBy,
			@PathVariable String professionalId,
			@RequestParam(required=false) String poiId,
			@RequestParam(required=false) Long startTime,  
			@RequestParam(required=false) double[] pos,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		professionalId = Utils.getContextProfessionalId();
//		if(Utils.isEmpty(poiId) || (startTime == null)) {
//			throw new WrongRequestException("bad parameters");
//		}
		if(page == null) {
			page = 1;
		}
		if(limit == null) {
			limit = 10;
		}		
		List<ServiceOffer> result = storageManager.searchServiceOffer(applicationId, professionalId, 
				serviceType, poiId, area, startTime, pos, page, limit, orderBy);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("searchServiceOffer[%s]:%d", applicationId, result.size()));
		}
		List<ServiceOfferUI> resultUI = Converter.convertServiceOffer(storageManager, applicationId, result);
		return resultUI;
	}
	
	@RequestMapping(value = "/api/{applicationId}/service/offer", method = RequestMethod.POST)
	public @ResponseBody ServiceOffer addServiceOffer(@PathVariable String applicationId,
			@RequestBody ServiceOffer serviceOffer,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		serviceOffer.setApplicationId(applicationId);
		String professionalId = Utils.getContextProfessionalId();
		serviceOffer.setProfessionalId(professionalId);
		ServiceOffer result = storageManager.saveServiceOffer(serviceOffer);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("addServiceOffer[%s]: user %s", applicationId, professionalId));
		}
		return result;		
	}
	
	@RequestMapping(value = "/api/{applicationId}/service/request", method = RequestMethod.POST)
	public @ResponseBody ServiceRequest addServiceRequest(@PathVariable String applicationId,
			@RequestBody ServiceRequest serviceRequest,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		serviceRequest.setApplicationId(applicationId);
		String professionalId = Utils.getContextProfessionalId();
		serviceRequest.setRequesterId(professionalId);
		ServiceRequest result = storageManager.saveServiceRequest(serviceRequest);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("addPublicServiceRequest[%s]: user %s", applicationId, professionalId));
		}
		return result;		
	}
	
	@RequestMapping(value = "/api/{applicationId}/service/offer/{professionalId}", method = RequestMethod.GET)
	public @ResponseBody List<ServiceOfferUI> getServiceOffers(@PathVariable String applicationId,
			@PathVariable String professionalId,
			@RequestParam(required=false) String serviceType,
			@RequestParam(required=false) Long timeFrom,
			@RequestParam(required=false) Long timeTo,
			@RequestParam(required=false) Integer page, 
			@RequestParam(required=false) Integer limit, 
			@RequestParam(required=false) Boolean withTime,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		if(page == null) {
			page = 1;
		}
		if(limit == null) {
			limit = 10;
		}
		List<ServiceOffer> result = storageManager.getServiceOffers(applicationId, professionalId, 
				serviceType, timeFrom, timeTo, withTime, page, limit);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getServiceOffers[%s]:%d", applicationId, result.size()));
		}
		List<ServiceOfferUI> resultUI = Converter.convertServiceOffer(storageManager, applicationId, result);
		return resultUI;
	}
	
	@RequestMapping(value = "/api/{applicationId}/service/offer/{professionalId}/{objectId}", method = RequestMethod.GET)
	public @ResponseBody ServiceOfferUI getServiceOfferById(@PathVariable String applicationId,
			@PathVariable String professionalId,
			@PathVariable String objectId,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		professionalId = Utils.getContextProfessionalId();
		ServiceOffer result = storageManager.getServiceOfferById(applicationId, objectId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getServiceOfferById[%s]:%s - %s", applicationId, professionalId, objectId));
		}
		if (result == null) return null;
		return Converter.convertServiceOffer(storageManager, applicationId, result);
	}
	
	@RequestMapping(value = "/api/{applicationId}/service/request/{professionalId}", method = RequestMethod.GET)
	public @ResponseBody List<ServiceRequestUI> getMyServiceRequests(@PathVariable String applicationId,
			@PathVariable String professionalId,
			@RequestParam(required=false) String serviceType,
			@RequestParam(required=false) Long timeFrom,
			@RequestParam(required=false) Long timeTo,
			@RequestParam(required=false) Integer page, 
			@RequestParam(required=false) Integer limit, 
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		professionalId = Utils.getContextProfessionalId();
		if(page == null) {
			page = 1;
		}
		if(limit == null) {
			limit = 10;
		}
		List<ServiceRequest> result = storageManager.getServiceRequests(applicationId, professionalId, 
				serviceType, timeFrom, timeTo, page, limit);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getServiceRequests[%s]:%d", applicationId, result.size()));
		}
		List<ServiceRequestUI> resultUI = Converter.convertServiceRequest(storageManager, applicationId, result, true);
		return resultUI;
	}
	@RequestMapping(value = "/api/{applicationId}/service/request/{professionalId}/tome", method = RequestMethod.GET)
	public @ResponseBody List<ServiceRequestUI> getServiceRequestsToMe(@PathVariable String applicationId,
			@PathVariable String professionalId,
			@RequestParam(required=false) String serviceType,
			@RequestParam(required=false) Long timeFrom,
			@RequestParam(required=false) Long timeTo,
			@RequestParam(required=false) Integer page, 
			@RequestParam(required=false) Integer limit, 
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		professionalId = Utils.getContextProfessionalId();
		if(page == null) {
			page = 1;
		}
		if(limit == null) {
			limit = 10;
		}
		List<ServiceRequest> result = storageManager.getServiceRequestsToMe(applicationId, professionalId, 
				serviceType, timeFrom, timeTo, page, limit);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getServiceRequests[%s]:%d", applicationId, result.size()));
		}
		List<ServiceRequestUI> resultUI = Converter.convertServiceRequest(storageManager, applicationId, result, false);
		return resultUI;
	}
	
	@RequestMapping(value = "/api/{applicationId}/service/offer/{professionalId}/{objectId}/requests", method = RequestMethod.GET)
	public @ResponseBody List<ServiceRequestUI> getServiceRequestsForOffer(@PathVariable String applicationId,
			@PathVariable String professionalId, @PathVariable String objectId, 
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		professionalId = Utils.getContextProfessionalId();
		List<ServiceRequest> result = storageManager.getOfferRequests(applicationId,  objectId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getServiceRequests[%s]:%d", applicationId, result.size()));
		}
		List<ServiceRequestUI> resultUI = Converter.convertServiceRequest(storageManager, applicationId, result, false);
		return resultUI;
	}
	
	@RequestMapping(value = "/api/{applicationId}/service/request/{professionalId}/{objectId}", method = RequestMethod.GET)
	public @ResponseBody ServiceRequestUI getServiceRequestById(@PathVariable String applicationId,
			@PathVariable String professionalId,
			@PathVariable String objectId,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		professionalId = Utils.getContextProfessionalId();
		ServiceRequest result = storageManager.getServiceRequestById(applicationId, objectId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getServiceRequestById[%s]:%s - %s", applicationId, professionalId, objectId));
		}
		if (result == null) return null;
		return Converter.convertServiceRequest(storageManager, applicationId, result);
	}
	
	@RequestMapping(value = "/api/{applicationId}/service/offer/{objectId}/{professionalId}", method = RequestMethod.DELETE)
	public @ResponseBody ServiceOffer deleteServiceOffer(@PathVariable String applicationId,
			@PathVariable String objectId,
			@PathVariable String professionalId,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		professionalId = Utils.getContextProfessionalId();
		ServiceOffer result = storageManager.deleteServiceOffer(applicationId, objectId, professionalId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("deleteServiceOffer[%s]:%s - %s", applicationId, objectId, professionalId));
		}
		return result;
	}
	
	@RequestMapping(value = "/api/{applicationId}/service/request/{objectId}/{professionalId}", method = RequestMethod.DELETE)
	public @ResponseBody ServiceRequest deleteServiceRequest(@PathVariable String applicationId,
			@PathVariable String objectId,
			@PathVariable String professionalId,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		professionalId = Utils.getContextProfessionalId();
		
		ServiceRequest req = storageManager.getServiceRequestById(applicationId, objectId);
		if (req == null) return null;
		
		if (!req.getProfessionalId().equals(professionalId) && !req.getRequesterId().equals(professionalId)) throw new UnauthorizedException("Only service provider or requester can delete");
		ServiceRequest result = storageManager.deleteServiceRequest(applicationId, objectId, professionalId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("deleteServiceRequest[%s]:%s - %s", applicationId, objectId, professionalId));
		}
		return result;
	}

	@RequestMapping(value = "/api/{applicationId}/service/request/{objectId}/{professionalId}/accept", method = RequestMethod.PUT)
	public @ResponseBody ServiceRequest acceptServiceRequest(@PathVariable String applicationId,
			@PathVariable String objectId,
			@PathVariable String professionalId,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		professionalId = Utils.getContextProfessionalId();
		ServiceRequest req = storageManager.getServiceRequestById(applicationId, objectId);
		if (!req.getProfessionalId().equals(professionalId)) throw new UnauthorizedException("Only service provider can accept");
		
		ServiceRequest result = storageManager.acceptServiceRequest(applicationId, objectId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("acceptServiceRequest[%s]:%s - %s", applicationId, objectId, professionalId));
		}
		return result;
	}
	
	@RequestMapping(value = "/api/{applicationId}/service/request/{objectId}/{professionalId}/reject", method = RequestMethod.PUT)
	public @ResponseBody ServiceRequest rejectServiceRequest(@PathVariable String applicationId,
			@PathVariable String objectId,
			@PathVariable String professionalId,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		professionalId = Utils.getContextProfessionalId();
		ServiceRequest req = storageManager.getServiceRequestById(applicationId, objectId);
		if (!req.getProfessionalId().equals(professionalId)) throw new UnauthorizedException("Only service provider can reject");
		
		ServiceRequest result = storageManager.rejectServiceRequest(applicationId, objectId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("rejectServiceRequest[%s]:%s - %s", applicationId, objectId, professionalId));
		}
		return result;
	}
//	@RequestMapping(value = "/api/{applicationId}/service/request/{objectId}/apply/{professionalId}", method = RequestMethod.PUT)
//	public @ResponseBody ServiceRequest applyServiceApplication(@PathVariable String applicationId,
//			@PathVariable String objectId,
//			@PathVariable String professionalId,
//			HttpServletRequest request, HttpServletResponse response) throws Exception {
//		professionalId = Utils.getContextProfessionalId();
//		ServiceRequest result = storageManager.applyToServiceRequest(applicationId, objectId, professionalId);
//		if(logger.isInfoEnabled()) {
//			logger.info(String.format("applyServiceApplication[%s]:%s - %s", applicationId, objectId, professionalId));
//		}
//		return result;
//	}
//	
//	@RequestMapping(value = "/api/{applicationId}/service/request/{objectId}/reject/{professionalId}", method = RequestMethod.PUT)
//	public @ResponseBody ServiceRequest rejectServiceApplication(@PathVariable String applicationId,
//			@PathVariable String objectId,
//			@PathVariable String professionalId,
//			HttpServletRequest request, HttpServletResponse response) throws Exception {
//		professionalId = Utils.getContextProfessionalId();
//		ServiceRequest result = storageManager.rejectServiceApplication(applicationId, objectId, professionalId);
//		if(logger.isInfoEnabled()) {
//			logger.info(String.format("rejectServiceApplication[%s]:%s - %s", applicationId, objectId, professionalId));
//		}
//		return result;
//	}
//	
//	@RequestMapping(value = "/api/{applicationId}/service/request/{objectId}/accept/{professionalId}", method = RequestMethod.PUT)
//	public @ResponseBody ServiceRequest acceptServiceApplication(@PathVariable String applicationId,
//			@PathVariable String objectId,
//			@PathVariable String professionalId,
//			HttpServletRequest request, HttpServletResponse response) throws Exception {
//		professionalId = Utils.getContextProfessionalId();
//		ServiceRequest result = storageManager.acceptServiceApplication(applicationId, objectId, professionalId);
//		if(logger.isInfoEnabled()) {
//			logger.info(String.format("acceptServiceApplication[%s]:%s - %s", applicationId, objectId, professionalId));
//		}
//		return result;
//	}
//	
//	@RequestMapping(value = "/api/{applicationId}/service/request/{objectId}/delete/{professionalId}", method = RequestMethod.PUT)
//	public @ResponseBody ServiceRequest deleteServiceApplication(@PathVariable String applicationId,
//			@PathVariable String objectId,
//			@PathVariable String professionalId,
//			HttpServletRequest request, HttpServletResponse response) throws Exception {
//		professionalId = Utils.getContextProfessionalId();
//		ServiceRequest result = storageManager.deleteServiceApplication(applicationId, objectId, professionalId);
//		if(logger.isInfoEnabled()) {
//			logger.info(String.format("deleteServiceApplication[%s]:%s - %s", applicationId, objectId, professionalId));
//		}
//		return result;
//	}
	
	@RequestMapping(value = "/api/{applicationId}/notification/{professionalId}", method = RequestMethod.GET)
	public @ResponseBody List<Notification> getNotifications(@PathVariable String applicationId,
			@PathVariable String professionalId,
			@RequestParam(required=false) Long timeFrom,
			@RequestParam(required=false) Long timeTo,
			@RequestParam(required=false) String type,
			@RequestParam(required=false) Boolean read,
			@RequestParam(required=false) Integer page, 
			@RequestParam(required=false) Integer limit, 
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		professionalId = Utils.getContextProfessionalId();
		if(page == null) {
			page = 1;
		}
		if(limit == null) {
			limit = 10;
		}
		List<Notification> result = storageManager.getNotifications(applicationId, professionalId, 
				timeFrom, timeTo, read, type, page, limit);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("getNotifications[%s]:%d", applicationId, result.size()));
		}
		return result;
	}
	
	@RequestMapping(value = "/api/{applicationId}/notification/{objectId}/read/{professionalId}", method = RequestMethod.PUT)
	public @ResponseBody Notification readNotification(@PathVariable String applicationId,
			@PathVariable String objectId,
			@PathVariable String professionalId,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		professionalId = Utils.getContextProfessionalId();
		Notification result = storageManager.readNotification(applicationId, objectId, professionalId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("readNotification[%s]:%s - %s", applicationId, objectId, professionalId));
		}
		return result;
	}

	@RequestMapping(value = "/api/{applicationId}/notification/offer/{objectId}/read/{professionalId}", method = RequestMethod.PUT)
	public @ResponseBody void readOfferNotifications(@PathVariable String applicationId,
			@PathVariable String objectId,
			@PathVariable String professionalId,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		professionalId = Utils.getContextProfessionalId();
		storageManager.readOfferNotifications(applicationId, objectId, professionalId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("readOfferNotifications[%s]:%s - %s", applicationId, objectId, professionalId));
		}
	}
	@RequestMapping(value = "/api/{applicationId}/notification/request/{objectId}/read/{professionalId}", method = RequestMethod.PUT)
	public @ResponseBody void readRequestNotifications(@PathVariable String applicationId,
			@PathVariable String objectId,
			@PathVariable String professionalId,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		professionalId = Utils.getContextProfessionalId();
		storageManager.readRequestNotifications(applicationId, objectId, professionalId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("readREquestNotifications[%s]:%s - %s", applicationId, objectId, professionalId));
		}
	}

	@RequestMapping(value = "/api/{applicationId}/notification/{objectId}/hidden/{professionalId}", method = RequestMethod.PUT)
	public @ResponseBody Notification hiddenNotification(@PathVariable String applicationId,
			@PathVariable String objectId,
			@PathVariable String professionalId,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		professionalId = Utils.getContextProfessionalId();
		Notification result = storageManager.hiddenNotification(applicationId, objectId, professionalId);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("hiddenNotification[%s]:%s - %s", applicationId, objectId, professionalId));
		}
		return result;
	}
	
	@RequestMapping(value = "/image/{applicationId}/{imageType}/{objectId}", method = RequestMethod.GET)
	public @ResponseBody HttpEntity<byte[]> downloadImage(
			@PathVariable String applicationId,
			@PathVariable String imageType, 
			@PathVariable String objectId, 
			@RequestParam String token,
			HttpServletRequest request, HttpServletResponse response) throws Exception {
		String name = objectId + "." + imageType;
		String path = imageUploadDir + "/" + name;
		if(logger.isInfoEnabled()) {
			logger.info("downloadImage:" + name);
		}
		// TODO: check token if necessary
		
		FileInputStream in = new FileInputStream(new File(path));
		byte[] image = IOUtils.toByteArray(in);
		HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.IMAGE_PNG);
		if(imageType.toLowerCase().equals("png")) {
			headers.setContentType(MediaType.IMAGE_PNG);
		} else if(imageType.toLowerCase().equals("gif")) {
			headers.setContentType(MediaType.IMAGE_GIF);
		} else if(imageType.toLowerCase().equals("jpg")) {
			headers.setContentType(MediaType.IMAGE_JPEG);
		} else if(imageType.toLowerCase().equals("jpeg")) {
			headers.setContentType(MediaType.IMAGE_JPEG);
		}
    headers.setContentLength(image.length);
    return new HttpEntity<byte[]>(image, headers);
	}
	
	@RequestMapping(value = "/api/{applicationId}/image/upload/{imageType}/{objectId}", method = RequestMethod.POST)
	public @ResponseBody String uploadImage(@PathVariable String applicationId,
			@PathVariable String imageType, 
			@PathVariable String objectId,
			@RequestParam("file") MultipartFile file,
			HttpServletRequest request) throws Exception {
		
		String professionalId = Utils.getContextProfessionalId();
		Professional profile = storageManager.findProfessionalById(applicationId, professionalId);
		if(profile == null) {
			throw new UnauthorizedException("profile not found");
		}
		if(!profile.getObjectId().equals(objectId)) {
			throw new UnauthorizedException("Not authorized");
		}
		
		String name = objectId + "." + imageType;
		if(logger.isInfoEnabled()) {
			logger.info("uploadImage:" + name);
		}
		if (!file.isEmpty()) {
			BufferedOutputStream stream = new BufferedOutputStream(new FileOutputStream(
					new File(imageUploadDir + "/" + name)));
			FileCopyUtils.copy(file.getInputStream(), stream);
			stream.close();
			storageManager.updateProfessionalImageByPEC(applicationId, profile.getPec(), "/"+imageType+ "/" + objectId);
		}
		return "{\"status\":\"OK\"}";
	}
	
	@RequestMapping(value = "/api/{applicationId}/profile/{professionalId}", method = RequestMethod.PUT)
	public @ResponseBody Professional updateProfessional(@PathVariable String applicationId,
			@PathVariable String professionalId,
			@RequestBody Professional professional,
			HttpServletRequest request) throws Exception {
		professionalId = Utils.getContextProfessionalId();
		professional.setObjectId(professionalId);
		professional = storageManager.updateProfessional(applicationId, professional);
		if(logger.isInfoEnabled()) {
			logger.info(String.format("updateProfessional[%s]:%s", applicationId, professionalId));
		}
		return professional;
	}
	
	@ExceptionHandler(WrongRequestException.class)
	@ResponseStatus(value=HttpStatus.BAD_REQUEST)
	@ResponseBody
	public Map<String,String> handleWrongRequestError(HttpServletRequest request, Exception exception) {
		exception.printStackTrace();
		return Utils.handleError(exception);
	}
	
	@ExceptionHandler(EntityNotFoundException.class)
	@ResponseStatus(value=HttpStatus.BAD_REQUEST)
	@ResponseBody
	public Map<String,String> handleEntityNotFoundError(HttpServletRequest request, Exception exception) {
		exception.printStackTrace();
		return Utils.handleError(exception);
	}
	
	@ExceptionHandler(UnauthorizedException.class)
	@ResponseStatus(value=HttpStatus.FORBIDDEN)
	@ResponseBody
	public Map<String,String> handleUnauthorizedError(HttpServletRequest request, Exception exception) {
		logger.error(exception.getMessage());
		return Utils.handleError(exception);
	}

	@ExceptionHandler(InsufficientBalanceException.class)
	@ResponseStatus(value=HttpStatus.PRECONDITION_FAILED)
	@ResponseBody
	public Map<String,String> handleBalanceError(HttpServletRequest request, Exception exception) {
		logger.error(exception.getMessage());
		return Utils.handleError(exception);
	}

	@ExceptionHandler(InvalidStateException.class)
	@ResponseStatus(value=HttpStatus.PRECONDITION_FAILED)
	@ResponseBody
	public Map<String,String> handleStateError(HttpServletRequest request, Exception exception) {
		logger.error(exception.getMessage());
		return Utils.handleError(exception);
	}

	@ExceptionHandler(Exception.class)
	@ResponseStatus(value=HttpStatus.INTERNAL_SERVER_ERROR)
	@ResponseBody
	public Map<String,String> handleGenericError(HttpServletRequest request, Exception exception) {
		exception.printStackTrace();
		return Utils.handleError(exception);
	}
	
}
