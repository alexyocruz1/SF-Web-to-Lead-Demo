# SF-Web-to-Lead-Demo

Proyecto de demostración y pruebas de Salesforce Web-to-Lead con obtención dinámica de picklists y creación de leads mediante API.

**Demo en vivo:** [https://sf-web-to-lead-demo.vercel.app/](https://sf-web-to-lead-demo.vercel.app/)

**Thank you page:** [https://sf-web-to-lead-demo.vercel.app/gracias.html](https://sf-web-to-lead-demo.vercel.app/gracias.html)

## Tabla de Contenidos

- [Tutorial Web-to-Lead](#tutorial-web-to-lead)
- [Instrucciones de Configuración](#instrucciones-de-configuración)
- [Variables de Entorno](#variables-de-entorno)
- [Endpoints de API](#endpoints-de-api)
- [Desarrollo](#desarrollo)

---

## Tutorial Web-to-Lead

### Configurar Web-to-Lead en Salesforce

1. **Habilitar Web-to-Lead**
   - Ve a **Setup** (Configuración) → Busca "Web-to-Lead"
   - Haz clic en **Web-to-Lead Settings** (Configuración de Web a Lead)
   - Habilita Web-to-Lead

2. **Crear el Formulario HTML**
   - Ve a **Setup** → Busca "Web-to-Lead"
   - Haz clic en **Create Web-to-Lead Form** (Crear Formulario de Web a Lead)
   - Selecciona los campos que deseas capturar
   - Haz clic en **Generate** (Generar)
   - Copia el código HTML

3. **Obtener tu ID de Organización (OID)**
   - El OID está incluido en el formulario generado
   - Formato: `<input type="hidden" name="oid" value="TU_ORG_ID">`

### Implementar Web-to-Lead en tu Sitio Web

El siguiente formulario puede ser copiado y pegado para usarse de manera instantanea, no contiene validaciones ni estilos.

Ejemplo completo con todos los campos estándar y personalizados de Salesforce disponibles:

```html
<!--  ----------------------------------------------------------------------  -->
<!--  NOTE: Please add the following <META> element to your page <HEAD>.      -->
<!--  If necessary, please modify the charset parameter to specify the        -->
<!--  character set of your HTML page.                                        -->
<!--  ----------------------------------------------------------------------  -->

<META HTTP-EQUIV="Content-type" CONTENT="text/html; charset=UTF-8">

<!--  ----------------------------------------------------------------------  -->
<!--  NOTE: Please add the following <FORM> element to your page.             -->
<!--  ----------------------------------------------------------------------  -->

<form action="https://test.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00DOx00000Mrgin" method="POST">

<input type=hidden name="oid" value="00DOx00000Mrgin">
<input type=hidden name="retURL" value="http://examplereturnpage.com">

<!--  ----------------------------------------------------------------------  -->
<!--  NOTE: These fields are optional debugging elements. Please uncomment    -->
<!--  these lines if you wish to test in debug mode.                          -->
<!--  <input type="hidden" name="debug" value=1>                              -->
<!--  <input type="hidden" name="debugEmail"                                  -->
<!--  value="alexy.cruz@experenta.com">                                       -->
<!--  ----------------------------------------------------------------------  -->

<label for="first_name">First Name</label><input  id="first_name" maxlength="40" name="first_name" size="20" type="text" /><br>

<label for="last_name">Last Name</label><input  id="last_name" maxlength="80" name="last_name" size="20" type="text" /><br>

<label for="email">Email</label><input  id="email" maxlength="80" name="email" size="20" type="text" /><br>

<label for="company">Company</label><input  id="company" maxlength="40" name="company" size="20" type="text" /><br>

<label for="city">City</label><input  id="city" maxlength="40" name="city" size="20" type="text" /><br>

<label for="state">State/Province</label><input  id="state" maxlength="20" name="state" size="20" type="text" /><br>

<label for="salutation">Salutation</label><select  id="salutation" name="salutation"><option value="">--None--</option><option value="Mr.">Mr.</option>
<option value="Ms.">Ms.</option>
<option value="Mrs.">Mrs.</option>
<option value="Dr.">Dr.</option>
<option value="Prof.">Prof.</option>
<option value="Mx.">Mx.</option>
</select><br>

<label for="title">Title</label><input  id="title" maxlength="40" name="title" size="20" type="text" /><br>

<label for="url">Website</label><input  id="url" maxlength="80" name="url" size="20" type="text" /><br>

<label for="phone">Phone</label><input  id="phone" maxlength="40" name="phone" size="20" type="text" /><br>

<label for="mobile">Mobile</label><input  id="mobile" maxlength="40" name="mobile" size="20" type="text" /><br>

<label for="fax">Fax</label><input  id="fax" maxlength="40" name="fax" size="20" type="text" /><br>

<label for="street">Street</label><textarea name="street"></textarea><br>

<label for="zip">Zip</label><input  id="zip" maxlength="20" name="zip" size="20" type="text" /><br>

<label for="country">Country</label><input  id="country" maxlength="40" name="country" size="20" type="text" /><br>

<label for="description">Description</label><textarea name="description"></textarea><br>

<label for="lead_source">Lead Source</label><select  id="lead_source" name="lead_source"><option value="">--None--</option><option value="Whatsapp">Whatsapp</option>
<option value="Facebook">Facebook</option>
<option value="Instagram">Instagram</option>
<option value="PaginaWeb">PaginaWeb</option>
<option value="Evento">Evento</option>
<option value="VisitaFabrica">VisitaFabrica</option>
<option value="OLGA">OLGA</option>
<option value="PP">PP</option>
<option value="DMTCatRental">DMTCatRental</option>
<option value="ReferenciaEmpleado">ReferenciaEmpleado</option>
<option value="CIPSA">CIPSA</option>
<option value="CARMIX">CARMIX</option>
<option value="Web to Lead">Web to Lead</option>
<option value="Email">Email</option>
</select><br>

<label for="industry">Industry</label><select  id="industry" name="industry"><option value="">--None--</option><option value="Agriculture">Agriculture</option>
<option value="Apparel">Apparel</option>
<option value="Banking">Banking</option>
<option value="Biotechnology">Biotechnology</option>
<option value="Chemicals">Chemicals</option>
<option value="Communications">Communications</option>
<option value="Construction">Construction</option>
<option value="Consulting">Consulting</option>
<option value="Education">Education</option>
<option value="Electronics">Electronics</option>
<option value="Energy">Energy</option>
<option value="Engineering">Engineering</option>
<option value="Entertainment">Entertainment</option>
<option value="Environmental">Environmental</option>
<option value="Finance">Finance</option>
<option value="Food &amp; Beverage">Food &amp; Beverage</option>
<option value="Government">Government</option>
<option value="Healthcare">Healthcare</option>
<option value="Hospitality">Hospitality</option>
<option value="Insurance">Insurance</option>
<option value="Machinery">Machinery</option>
<option value="Manufacturing">Manufacturing</option>
<option value="Media">Media</option>
<option value="Not For Profit">Not For Profit</option>
<option value="Other">Other</option>
<option value="Recreation">Recreation</option>
<option value="Retail">Retail</option>
<option value="Shipping">Shipping</option>
<option value="Technology">Technology</option>
<option value="Telecommunications">Telecommunications</option>
<option value="Transportation">Transportation</option>
<option value="Utilities">Utilities</option>
</select><br>

<label for="rating">Rating</label><select  id="rating" name="rating"><option value="">--None--</option><option value="Hot">Hot</option>
<option value="Warm">Warm</option>
<option value="Cold">Cold</option>
</select><br>

<label for="currency"><span class="assistiveText">*</span>Lead Currency</label><select  id="currency" name="currency"><option value="HNL" selected="selected">HNL - Honduras Lempira</option>
<option value="NIO">NIO - Nicaragua Cordoba</option>
<option value="USD">USD - U.S. Dollar</option>
</select><br>

<label for="revenue">Annual Revenue</label><input  id="revenue" name="revenue" size="20" type="text" /><br>

<label for="employees">Employees</label><input  id="employees" name="employees" size="20" type="text" value="" /><br>

<label for="Campaign_ID">Campaign</label><select  id="Campaign_ID" name="Campaign_ID"><option value="">--None--</option></select><br>

<input type="hidden"  id="member_status" name="member_status" value="" /><br>

<label for="emailOptOut">Email Opt Out</label><input  id="emailOptOut" name="emailOptOut" type="checkbox" value="1" /><br>

<label for="faxOptOut">Fax Opt Out</label><input  id="faxOptOut" name="faxOptOut" type="checkbox" value="1" /><br>

<label for="doNotCall">Do Not Call</label><input  id="doNotCall" name="doNotCall" type="checkbox" value="1" /><br>

CAT Lead ID:<select  id="00NOx00000g8M9d" name="00NOx00000g8M9d" title="CAT Lead ID"><option value="">--None--</option><option value="PSE ID OLGA">PSE ID OLGA</option>
<option value="PP+">PP+</option>
<option value="DMT">DMT</option>
</select><br>

PSE Modelo Maquinaria:<input  id="00NOx00000g8KzV" maxlength="255" name="00NOx00000g8KzV" size="20" type="text" /><br>

PSE Serie Maquinaria:<input  id="00NOx00000g8MCr" maxlength="255" name="00NOx00000g8MCr" size="20" type="text" /><br>

PSE Type:<input  id="00NOx00000g8MG5" maxlength="255" name="00NOx00000g8MG5" size="20" type="text" /><br>

PSE Origen:<input  id="00NOx00000g8MJJ" maxlength="255" name="00NOx00000g8MJJ" size="20" type="text" /><br>

PSE Monto de Oportunidad:<input  id="00NOx00000g8MMX" maxlength="255" name="00NOx00000g8MMX" size="20" type="text" /><br>

PSE Unidades de SMU:<input  id="00NOx00000g8MO9" maxlength="255" name="00NOx00000g8MO9" size="20" type="text" /><br>

PSE SMU:<input  id="00NOx00000g8MPl" name="00NOx00000g8MPl" size="20" type="text" /><br>

PSE Numero de Asesor:<input  id="00NOx00000g8MSz" maxlength="255" name="00NOx00000g8MSz" size="20" type="text" /><br>

PSE Asesor:<input  id="00NOx00000g8MUb" maxlength="255" name="00NOx00000g8MUb" size="20" type="text" /><br>

PSE Status:<select  id="00NOx00000g8LiE" name="00NOx00000g8LiE" title="PSE Status"><option value="">--None--</option><option value="Aceptado">Aceptado</option>
<option value="Rechazado">Rechazado</option>
<option value="Pendiente">Pendiente</option>
</select><br>

PSE Descripción:<input  id="00NOx00000g8MWD" maxlength="255" name="00NOx00000g8MWD" size="20" type="text" /><br>

Mensaje:<textarea  id="00NOx00000g8N2T" name="00NOx00000g8N2T" type="text" wrap="soft"></textarea><br>

Tipo de Negocio:<select  id="00NOx00000g8NIb" name="00NOx00000g8NIb" title="Tipo de Negocio"><option value="">--None--</option><option value="Automático parte de la información Rubro">Automático parte de la información Rubro</option>
<option value="Equipo">Equipo</option>
<option value="Repuestos">Repuestos</option>
<option value="Rental y Servicios">Rental y Servicios</option>
</select><br>

Rubro:<select  id="00NOx00000g8LaB" name="00NOx00000g8LaB" title="Rubro"><option value="">--None--</option><option value="Maquinaria CAT">Maquinaria CAT</option>
<option value="Maquinaria SEM">Maquinaria SEM</option>
<option value="Repuestos Camion International">Repuestos Camion International</option>
<option value="Repuestos Camion Volkswagen">Repuestos Camion Volkswagen</option>
<option value="Mano de Obra Comercial">Mano de Obra Comercial</option>
<option value="Lubricantes">Lubricantes</option>
<option value="Llantas">Llantas</option>
<option value="Repuestos Automotrices">Repuestos Automotrices</option>
<option value="Repuestos New Holland">Repuestos New Holland</option>
<option value="Mangueras">Mangueras</option>
<option value="STIHL">STIHL</option>
<option value="Trapp">Trapp</option>
<option value="Otro">Otro</option>
</select><br>

Subrubro:<select  id="00NOx00000g8NdZ" name="00NOx00000g8NdZ" title="Subrubro"><option value="">--None--</option><option value="Nuevo CAT">Nuevo CAT</option>
<option value="Usado CAT">Usado CAT</option>
<option value="Chasis">Chasis</option>
<option value="Eje Delantero">Eje Delantero</option>
<option value="Suspension">Suspension</option>
<option value="Frenos">Frenos</option>
<option value="Direccion">Direccion</option>
<option value="Cardanes">Cardanes</option>
<option value="Escape">Escape</option>
<option value="Sistema Electrico">Sistema Electrico</option>
<option value="Tono">Tono</option>
<option value="Miscelaneos">Miscelaneos</option>
<option value="Embrague">Embrague</option>
<option value="Motor">Motor</option>
<option value="Transmision">Transmision</option>
<option value="Eje Trasero">Eje Trasero</option>
<option value="Tanques">Tanques</option>
<option value="Cabina">Cabina</option>
<option value="Ruedas">Ruedas</option>
<option value="Telemetria IH">Telemetria IH</option>
<option value="Chasis VW">Chasis VW</option>
<option value="Eje Delantero VW">Eje Delantero VW</option>
<option value="Suspension VW">Suspension VW</option>
<option value="Frenos VW">Frenos VW</option>
<option value="Direccion VW">Direccion VW</option>
<option value="Cardanes VW">Cardanes VW</option>
<option value="Escape VW">Escape VW</option>
<option value="Sistema Electrico VW">Sistema Electrico VW</option>
<option value="Tono VW">Tono VW</option>
<option value="Miscelaneos VW">Miscelaneos VW</option>
<option value="Embrague VW">Embrague VW</option>
<option value="Motor VW">Motor VW</option>
<option value="Transmision VW">Transmision VW</option>
<option value="Eje Trasero VW">Eje Trasero VW</option>
<option value="Tanques VW">Tanques VW</option>
<option value="Cabina VW">Cabina VW</option>
<option value="Ruedas VW">Ruedas VW</option>
<option value="Telemetria VW">Telemetria VW</option>
<option value="Mano de Obra General">Mano de Obra General</option>
<option value="Planes de Mantenimiento IH">Planes de Mantenimiento IH</option>
<option value="Planes de Mantenimiento VW">Planes de Mantenimiento VW</option>
<option value="Planes de Manenimiento NH">Planes de Manenimiento NH</option>
<option value="Lubricante CVL Camion">Lubricante CVL Camion</option>
<option value="Lubricante CVL Automotriz">Lubricante CVL Automotriz</option>
<option value="Lubricantes Industria">Lubricantes Industria</option>
<option value="Lubricantes PVL">Lubricantes PVL</option>
<option value="Llantas Construccion">Llantas Construccion</option>
<option value="Llantas Camion">Llantas Camion</option>
<option value="Llantas Automotriz">Llantas Automotriz</option>
<option value="Llantas Agricola">Llantas Agricola</option>
<option value="Llantas Industria">Llantas Industria</option>
<option value="Llantas de Moto">Llantas de Moto</option>
<option value="Car Care Michelin">Car Care Michelin</option>
<option value="Automotriz">Automotriz</option>
<option value="NAPA">NAPA</option>
<option value="New Holland (NH, BN, N1)">New Holland (NH, BN, N1)</option>
<option value="PLM">PLM</option>
<option value="Filtros">Filtros</option>
<option value="Tren de Fuerza">Tren de Fuerza</option>
<option value="Electricidad">Electricidad</option>
<option value="Walpeco (WP)">Walpeco (WP)</option>
<option value="Discos de Agricola (RO)">Discos de Agricola (RO)</option>
<option value="Telemetria NH">Telemetria NH</option>
<option value="Otros New Holland">Otros New Holland</option>
<option value="Mangueras">Mangueras</option>
<option value="Equipo Stihl">Equipo Stihl</option>
<option value="Repuestos Stihl">Repuestos Stihl</option>
<option value="Equipo Trapp">Equipo Trapp</option>
<option value="Repuestos Trapp">Repuestos Trapp</option>
<option value="Otro">Otro</option>
</select><br>

Categoría Producto:<input  id="00NOx00000g8O09" maxlength="255" name="00NOx00000g8O09" size="20" type="text" /><br>

Fecha Entrada Etapa:<span class="dateInput dateOnlyInput"><input  id="00NOx00000g8ORZ" name="00NOx00000g8ORZ" size="12" type="text" /></span><br>

Seguimiento de Lead:<textarea  id="00NOx00000g9FPR" name="00NOx00000g9FPR" type="text" wrap="soft"></textarea><br>

PSE ID:<input  id="00NOx00000g9PlN" maxlength="255" name="00NOx00000g9PlN" size="20" type="text" /><br>

Area:<select  id="00NOx00000gCpbF" name="00NOx00000gCpbF" title="Area"><option value="">--None--</option><option value="CEMCOL CAT">CEMCOL CAT</option>
<option value="CEMCOL Comercial">CEMCOL Comercial</option>
<option value="New Holland">New Holland</option>
<option value="OLGA">OLGA</option>
</select><br>

División:<select  id="00NOx00000gFoCP" name="00NOx00000gFoCP" title="División"><option value="">--None--</option><option value="CEMCOL CAT">CEMCOL CAT</option>
<option value="CEMCOL El Salvador">CEMCOL El Salvador</option>
<option value="CEMCOL Nicaragua">CEMCOL Nicaragua</option>
<option value="CEMCOL COMERCIAL">CEMCOL COMERCIAL</option>
</select><br>

PSE Monto:<input  id="00NOx00000gIH2D" maxlength="255" name="00NOx00000gIH2D" size="20" type="text" /><br>

PSE Big Rock:<input  id="00NOx00000gIH3p" maxlength="255" name="00NOx00000gIH3p" size="20" type="text" /><br>

PSE DCN:<input  id="00NOx00000gIH73" maxlength="255" name="00NOx00000gIH73" size="20" type="text" /><br>

PSE SN:<input  id="00NOx00000gIHAH" maxlength="255" name="00NOx00000gIHAH" size="20" type="text" /><br>

PSE Descripción de Estado:<input  id="00NOx00000gIHDV" maxlength="255" name="00NOx00000gIHDV" size="20" type="text" /><br>

<input type="submit" name="submit">

</form>
```

### Componentes Clave Explicados

#### 1. URL de Acción del Formulario
```html
<form action="https://test.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=TU_ORG_ID" method="POST">
```
- Usar `https://test.salesforce.com` para sandboxes
- Usar `https://webto.salesforce.com` para producción
- Reemplaza `TU_ORG_ID` con ID de Organización real

#### 2. ID de Organización (Requerido)
```html
<input type="hidden" name="oid" value="TU_ORG_ID">
```
Esto identifica qué organización de Salesforce recibe el lead.

#### 3. URL de Retorno
```html
<input type="hidden" name="retURL" value="https://tusitio.com/gracias.html">
```
Redirige a los usuarios a una página de agradecimiento después del envío.

#### 4. Modo Debug (Opcional)
```html
<input type="hidden" name="debug" value="1">
<input type="hidden" name="debugEmail" value="tu.email@ejemplo.com">
```
Descomentar estas líneas durante las pruebas para recibir emails de depuración.

#### 5. Campos Estándar
Usa los nombres de campo estándar de Salesforce:
- `first_name`, `last_name`, `email`, `phone`, `company`
- `street`, `city`, `state`, `zip`, `country`
- `lead_source`, `industry`, `rating`

#### 6. Campos Personalizados
Los campos personalizados usan su ID de campo de Salesforce:
```html
<input id="00NOx00000g8LaB" name="00NOx00000g8LaB" />
```

### Posibles errores

- Campos requeridos por Salesforce no son enviados en el web to lead.
- Campos de correo electronico no tienen el formato correcto "correo@gmail.com".
- El formulario no envia el campo correcto para picklist, en lugar de enviar "Chasis" envia "chasis" o "chasi".

---

## Ejemplos de Payloads

### Ejemplo Mínimo (Campos Requeridos)

Este es el payload mínimo requerido para crear un lead en Salesforce. Incluye todos los campos obligatorios:

```json
{
  "FirstName": "Juan",
  "LastName": "Cruz",
  "City": "Tegucigalpa",
  "State": "Francisco Morazan",
  "Country": "Honduras",
  "Phone": "+50498811355",
  "Company": "Acme Corp",
  "Mensaje__c": "Mensaje de lead",
  "Rubro__c": "Maquinaria CAT",
  "Subrubro__c": "Nuevo CAT",
  "Division__c": "CEMCOL CAT"
}
```

---

## Ejemplo de Payload Completo: PSE

```json
{
  "account_name": "INVERSIONES AVICOLAS DE HONDURAS S.A.",
  "assigned_user_id": "0cba0ef8-b995-11e6-b8ab-027a430c0995",
  "description": "Customer Details\nCustomer has a fleet of 3 units with a coverage of:\n  33% - CVA's that meet the minimum definition\n  0% - EPP's\n  33% - Connected Assets\nThere are 1 expiring contracts with a future 12 month opp. of 1,484 USD for maintenance parts (MP) and 0 USD for repair parts (RP)\nCustomer Product Support Segment is WWM\n\nEquipment Details (sorted by MP opportunity) are\nMPW02336 (236D) – Expires on 2021-07-20 (PM) – Opp. MP 1,484 USD / RP 0 USD - SMU 1197h / mthly utiliz 140h",
  "email1": "rdperez@inavih.com",
  "first_name": "847225",
  "last_name": "INVERSIONES AVICOLAS DE HONDURAS S.A DE C V",
  "lead_source": "PSE de Ventas",
  "opportunity_amount": "1484.0",
  "phone_mobile": "9852-4428",
  "primary_address_street": "EL ZAPOTE, SAN FRANCISCO DE YOJOA,CORTES",
  "pse_amount_c": "1484.000000",
  "pse_big_rock_c": "1",
  "pse_dcn_c": "847225",
  "pse_id_c": "26FEB14D-463E-4277-BCF5-50510CED4948",
  "pse_model_c": "",
  "pse_sales_rep_c": "YURY FAVIANA RAMOS HERNANDEZ",
  "pse_sales_rep_id_c": "030866",
  "pse_smu_c": null,
  "pse_smu_units_c": "H",
  "pse_sn_c": "",
  "rubro_c": "Repuestos Caterpillar",
  "status_description": "Customer Details\nCustomer has a fleet of 3 units with a coverage of:\n  33% - CVA's that meet the minimum definition\n  0% - EPP's\n  33% - Connected Assets\nThere are 1 expiring contracts with a future 12 month opp. of 1,484 USD for maintenance parts (MP) and 0 USD for repair parts (RP)\nCustomer Product Support Segment is WWM\n\nEquipment Details (sorted by MP opportunity) are\nMPW02336 (236D) – Expires on 2021-07-20 (PM) – Opp. MP 1,484 USD / RP 0 USD - SMU 1197h / mthly utiliz 140h"
}
```

### Mapeo de Campos PSE a Salesforce

Esta tabla documenta cómo se mapean los campos del sistema PSE a los campos de Salesforce Lead.

| Campo JSON | Campo Salesforce | Tipo de Dato | Notas |
|------------|------------------|--------------|-------|
| `account_name` | Company | Texto | Longitud maxima de 255 |
| `assigned_user_id` | OwnerId | Id | Id de usuario existente dentro de salesforce |
| `description` | PSE_Descripcion__c | Texto | Longitud maxima de 255 |
| `email1` | Email | Email (formato de correo) | - |
| `first_name` | FirstName | Texto | Longitud maxima de 40 |
| `last_name` | LastName | Texto | Longitud maxima de 80 |
| `lead_source` | PSE_Origen__c | Texto | Longitud maxima de 80 |
| `opportunity_amount` | PSE_Monto_de_Oportunidad__c | Texto | Longitud maxima de 255 |
| `phone_mobile` | MobilePhone | Phone (Numeros, +, ()) | - |
| `primary_address_street` | Address | Address (texto) | - |
| `pse_amount_c` | PSE_Monto__c | Texto | Longitud maxima de 255 |
| `pse_big_rock_c` | PSE_Big_Rock__c | Texto | Longitud maxima de 255 |
| `pse_dcn_c` | PSE_DCN__c | Texto | Longitud maxima de 255 |
| `pse_id_c` | PSE_ID__c | Texto | Longitud maxima de 255 |
| `pse_model_c` | PSE_Modelo_Maquinaria__c | Texto | Longitud maxima de 255 |
| `pse_sales_rep_c` | PSE_Asesor__c | Texto | Longitud maxima de 255 |
| `pse_sales_rep_id_c` | PSE_Numero_de_Asesor__c | Texto | Longitud maxima de 255 |
| `pse_smu_c` | PSE_SMU__c | Texto | Longitud maxima de 255 |
| `pse_smu_units_c` | PSE_Unidades_de_SMU__c | Texto | Longitud maxima de 255 |
| `pse_sn_c` | PSE_SN__c | Texto | Longitud maxima de 255 |
| `rubro_c` | Rubro__c | Valor de lista de seleccion | debe ser un valor dentro de la lista descrita abajo |
| `status_description` | PSE_Descripcion_de_Estado__c | Texto | Longitud maxima de 255 |

### Valores de Picklists

#### Rubro__c (Rubro)

- Maquinaria CAT
- Maquinaria SEM
- Repuestos Camion International
- Repuestos Camion Volkswagen
- Mano de Obra Comercial
- Lubricantes
- Llantas
- Repuestos Automotrices
- Repuestos New Holland
- Mangueras
- STIHL
- Trapp
- Otro

---

## Instrucciones de Configuración

### Generar Certificado y Clave Privada para JWT Bearer Flow

#### Opción 1: OpenSSL Manual (Bash/Terminal)

```bash
# Paso 1: Generar clave privada (2048 bits)
openssl genrsa -out salesforce-private-key.pem 2048

# Paso 2: Generar certificado autofirmado válido por 1 año (365 días)
openssl req -new -x509 -key salesforce-private-key.pem -out salesforce-cert.pem -days 365

# Durante la generación del certificado te pedirá información:
# Country Name: HN (Honduras) o cualquier país
# State: Francisco Morazan (o cualquier estado o departamento)
# Locality: Tegucigalpa (o cualquier ciudad)
# Organization: CEMCOL (o cualquier empresa)
# Organizational Unit: IT (o cualquier departamento)
# Common Name: api.cemcol.com (o cualquier dominio o nombre)
# Email: email@cemcol.com (o cualquier email)
```

#### Opción 2: PowerShell (Windows)

```powershell
# Instalar OpenSSL via Chocolatey
choco install openssl

# O descargar desde: https://slproweb.com/products/Win32OpenSSL.html

# Luego usar los mismos comandos que en Opción 1
openssl genrsa -out salesforce-private-key.pem 2048
openssl req -new -x509 -key salesforce-private-key.pem -out salesforce-cert.pem -days 365
```

### Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tuusuario/SF-Web-to-Lead-Demo.git
cd SF-Web-to-Lead-Demo
```

2. Instala las dependencias:
```bash
npm install
```

3. Crear un archivo `.env` en el directorio raíz:
```bash
cp .env.example .env
```

4. Configurar las variables de entorno (ver abajo)

5. Ejecuta localmente:
```bash
npm run dev
```

6. Abre el navegador:
```
http://localhost:3000
```

---

## Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```env
# Salesforce Connected App
CLIENT_KEY=tu_consumer_key_de_connected_app

# Claves Privadas JWT (ruta al archivo o contenido de la clave)
SF_JWT_PRIVATE_TEST_KEY=/ruta/a/test-private-key.pem
SF_JWT_PRIVATE_PRODUCTION_KEY=/ruta/a/prod-private-key.pem

# Nombres de Usuario de Salesforce
TEST_USERNAME=usuario@ejemplo.com.sandbox
PRODUCTION_USERNAME=usuario@ejemplo.com

# URLs de OAuth de Salesforce
TEST_URL=https://test.salesforce.com/services/oauth2/token
PRODUCTION_URL=https://login.salesforce.com/services/oauth2/token

# URLs de Instancia de Salesforce
TEST_INSTANCE=https://tuorg--sandbox.sandbox.my.salesforce.com
PRODUCTION_INSTANCE=https://tuorg.my.salesforce.com

# Versión de API
SF_API_VERSION=65.0

# Flag de entorno
USE_PRODUCTION=false
```

### Obtener los Valores

1. **CLIENT_KEY**: Consumer Key de Connected App
2. **Claves Privadas**: Generar usando OpenSSL u otra herramienta, subir el certificado a la Connected App
3. **Nombres de Usuario**: Usuario de Salesforce autorizado para acceso API
4. **URLs de Instancia**: URL de My Domain de tu organización
5. **Versión de API**: Consulta las notas de la versión de Salesforce para la última versión

---

## Endpoints de API

### POST `/api/leads`
Crear leads usando la API REST de Salesforce.

**Petición:**
```json
{
  "environment": "test",
  "endpoint": "/services/data/v65.0/sobjects/Lead",
  "body": {
    "FirstName": "Juan",
    "LastName": "Pérez",
    "Company": "Acme Corp",
    "Email": "juan@ejemplo.com"
  }
}
```

**Respuesta:**
```json
{
  "id": "00Q1234567890ABC",
  "success": true
}
```

### GET `/api/picklists`
Obtener valores de picklist dinámicos con dependencias.

**Petición:**
```
GET /api/picklists?environment=test
```

**Respuesta:**
```json
{
  "controllingValues": [
    { "label": "Opción 1", "value": "Opción 1" }
  ],
  "dependencies": {
    "Opción 1": [
      { "label": "Sub Opción 1", "value": "Sub Opción 1" }
    ]
  }
}
```

---

## Desarrollo

### Estructura del Proyecto

```
SF-Web-to-Lead-Demo/
├── api/
│   ├── leads.js          # API de creación de leads
│   └── picklists.js      # API de obtención de picklists
├── index.html            # Página principal del demo
├── gracias.html          # Página de agradecimiento
├── styles.css            # Estilos
├── server.js             # Servidor de desarrollo local
├── package.json          # Dependencias
└── README.md             # Documentación
```
