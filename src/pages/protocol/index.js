import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import './index.scss'

export default function Index() {

  Index.config = {
    navigationBarTitleText: '资产通平台服务条款及说明'
  }

  return (
    <View className='boxs'>
      <View className=' protocol'>
        <View className='indent'>
          资产通小程序为平台注册用户（以下简称“用户”、“用户单位”）提供服务。平台注册服务协议，是平台与用户就本协议所述相关服务事项所订立的有效合约。用户通过网络页面点击确认或以其他方式选择接受本协议并完成全部注册程序后，即表示用户与资产通已达成协议并同意接受本协议的全部约定内容以及与本协议有关的各项规则及资产通平台所包含的其他与本协议或本协议项下各项规则的条款有关的各项规定。 如果用户不同意本协议的任一内容，或者无法准确理解资产通对条款的解释，请不要进行后续操作。
        </View>
        <View className='hh'>一、服务内容</View>
        <View className='indent mt'>1.1 资产通的具体服务内容由资产通根据实际情况提供，内容主要包括资产使用权益在线交易服务、用户与银行支付系统提供媒介服务以及其他用户服务。 （1）资产使用权属在线交易服务提供的内容（包括但不限于用户的单位名称、联系人、联系信息、业务产品的描述和说明、相关图片、相关业务收费等）的信息均由用户在线提交，相关用户依法应对其发布的任何信息承担全部责任，资产通对此类信息的准确性、完整性、合法性或真实性均不承担任何责任。 （2）银行支付系统利用科技手段嵌入资产通系统，为资产通用户提供融资服务、资金存管与监管、资产信息的真实性及有效性进行验证、对资产流转状态进行判别等服务，具体权利责任及风险认定视用户使用的银行支付系统相关协议声明而定。资产通在用户与银行支付系统间为媒介角色存在，资产通在其中不承担任何法律责任。</View>
        <View className='indent mt'>1.2 资产通对于用户的通知及任何其他的协议、告示，用户同意资产通通过平台公告、手机短信、站内通知等电子方式或常规的信件传递等方式进行，该等通知于发送之日视为已送达收件人。因信息传输等原因导致用户未在前述通知发出当日收到该等通知的，资产通不承担责任。</View>
        <View className='indent mt'>1.3 在资产通使用相关服务需订立的合同采用电子合同方式。用户使用注册账号登录资产通平台后，根据资产通的相关规则或有关合同约定，在平台通过点击确认或约定方式签订的电子合同，即视为用户真实意思表示并以用户名义签订的合同，具有法律效力。用户应妥善保管自己的注册账号和密码等注册信息，用户通过前述方式订立的电子合同对合同各方具有法律约束力，用户不得以其注册账号和密码等注册信息被盗用或其他理由否认已订立的合同的效力或不按照该等合同履行相关义务。</View>
        <View className='indent mt'>1.4 用户根据本协议、平台的相关规则或有关合同约定签订电子合同后，不得擅自单方面修改该合同。资产通向用户提供电子合同的备案、查看服务。如对此有任何争议，应以资产通记录的合同为准。</View>
        <View className='indent mt'>1.5 在不违反适用法律的强制性规定的前提下，资产通提供的服务有可能会发生变更或者增加。一旦本服务协议的内容发生变动，资产通将通过平台公布最新的服务协议，不再向用户作个别通知。如用户不同意资产通对本服务协议所做的修改，用户有权停止使用资产通服务。如果用户继续使用资产通服务，即表示同意接受经修订的协议和规则。如新旧规则或协议之间冲突或矛盾的，除另行明确声明外，以最新修订的协议和规则为准。</View>
        <View className='hh'>二、用户保证及承诺事项</View>
        <View className='indent mt'>2.1 用户必须依资产通要求提供真实、有效、准确及完整的资料，并且授予资产通基于提供平台服务的目的对其提供的资料及数据信息拥有永久的、免费的使用权利。</View>
        <View className='indent mt'>2.2 用户有义务维持并更新注册的用户资料，确保其为真实、有效、准确及完整。若用户提供任何错误、虚假、过时或不完整的资料，或者资产通依其独立判断怀疑资料为错误、虚假、过时或不完整，资产通有权暂停或终止用户在资产通的注册账号，并拒绝用户使用资产通服务的部分或全部功能。在此情况下，资产通不承担任何责任，用户同意承担因此所产生的直接或间接的任何支出或损失。</View>
        <View className='indent mt'>2.3 用户保证并承诺通过资产通平台进行交易的资产和资金来源合法。</View>
        <View className='indent mt'>2.4 用户承诺，其通过资产通平台发布的信息均真实有效，其向资产通提交的任何资料均真实、有效、完整、准确。如因违背上述承诺造成资产通损失，用户将承担相应责任。</View>
        <View className='indent mt'>2.5 用户不得私自仿制、伪造在平台上签订的电子合同或印章，不得用伪造的合同进行招摇撞骗或进行其他非法使用，否则由用户自行承担责任。</View>
        <View className='hh'>三、风险提示</View>
        <View className='indent mt'>3.1 用户知晓并同意，任何通过资产通平台进行的交易并不能避免以下风险的产生，资产通不能也没有义务为如下风险负责： （1）政策风险：有关法律、法规及相关政策、规则发生变化，可能引起相关等方面异常情况，用户有可能遭受损失。 （2）不可抗力因素导致的风险。 （3）因用户的过错导致的任何损失，该过错包括但不限于：决策失误、操作不当、遗忘或泄露密码、密码被他人破解、用户使用的计算机系统被第三方侵入、用户委托他人代理交易时他人恶意或不当操作而造成的损失。</View>
        <View className='hh'>四、服务费用</View>
        <View className='indent mt'>4.1 当用户使用资产通服务时，资产通会向对平台上的特定服务向用户收取相关服务费用。各项服务费用详见平台上公布的《资产通平台费用及其他规则》。资产通保留单方面制定及调整服务费用的权利。</View>
        <View className='hh'>五、用户安全及管理</View>
        <View className='indent mt'>5.1 用户知晓并同意，确保用户注册账号及密码的机密安全是用户的责任。用户将对利用该注册账号及密码所进行的一切行动及言论，负完全的责任，并同意以下事项： （1）用户不对其他任何人泄露注册用户名或密码，亦不可使用其他任何人的资产通平台注册账号或密码。因黑客、病毒或用户的保管疏忽等非资产通原因导致用户的注册账号遭他人非法使用的，资产通不承担任何责任。 （2）资产通通过用户的注册账号及密码来识别用户的指令，用户确认，使用用户注册账号和密码登录后在资产通的一切行为均代表用户单位同意。用户注册账号操作所产生的电子信息记录均为用户行为的有效凭据，并由用户单位承担由此产生的全部责任。 （3）冒用他人注册账号及密码的，资产通及其合法授权主体保留追究实际使用人连带责任的权利。</View>
        <View className='indent mt'>5.2 用户如发现有第三人冒用或盗用用户注册账号及密码，或其他任何未经合法授权的情形，应立即以有效方式通知资产通，要求资产通暂停相关服务，否则由此产生的一切责任由用户单位承担。同时，用户理解资产通对用户的请求采取行动需要合理期限，在此之前，资产通对第三人使用该服务所导致的损失不承担任何责任。</View>
        <View className='indent mt'>5.3 用户决定不再使用注册账号时，并向资产通申请注销该注册账号。注册账号被注销后，用于与资产通基于本协议的合同关系终止，资产通没有义务为用户保留或向用户披露注册用户中的任何信息，但资产通仍有权继续使用该用户在接受平台服务期间发布的所有信息。</View>
        <View className='hh'>六、用户守法义务</View>
        <View className='indent mt'>6.1 用户承诺绝不为任何非法目的或以任何非法方式使用资产通服务，并承诺遵守中华人民共和国相关法律、法规及一切使用互联网之行业惯例、国际惯例，遵守所有与资产通服务有关的网络协议、规则。</View>
        <View className='indent mt'>6.2 在接受资产通服务的过程中，用户承诺不从事下列行为： （1）发表、传送、传播、储存侵害他人知识产权、商业秘密权等合法权利的内容。 （2）制造虚假身份、发布虚假信息等误导、欺骗他人，或违背用户页面公布之交易规则、活动规则进行虚假交易。 （3）进行危害计算机网络安全的行为。</View>
        <View className='indent mt'>6.3 在使用资产通平台服务的过程中，用户承诺遵守以下约定： （1）在使用资产通平台服务过程中实施的所有行为均遵守国家法律、法规及资产通平台各项规则，不违背社会公共利益或公共道德，不损害他人的合法权益。 （2）不发布国家禁止发布的信息，不发布其它涉嫌违法或违反本协议及各类规则的信息。 （3）不对资产通平台上的任何数据作商业性利用，包括但不限于在未经资产通事先书面同意的情况下，以复制、传播等任何方式使用资产通平台上展示的资料。</View>
        <View className='indent mt'>6.4 用户了解并同意： （1）违反上述承诺时，资产通有权依据本协议的约定，做出相应处理或终止向用户提供服务，且无须征得用户的同意或提前通知该用户。 （2）当用户的行为涉嫌违反法律法规或违反本协议和/或规则的，资产通有权采取相应措施，包括但不限于直接屏蔽、删除侵权信息，或直接停止提供服务。如使资产通遭受任何损失的（包括但不限于受到第三方的索赔、受到行政管理部门的处罚等），用户还应当赔偿或补偿资产通遭受的损失及（或）发生的费用，包括诉讼费、律师费、保全费等。</View>
        <View className='indent mt'>6.5、用户同意，由于违反本协议，或违反其在资产通上签订的协议或文件，或由于用户使用资产通服务违反了任何法律或第三方的权利而导致任何第三方向资产通提出的任何补偿申请或要求（包括律师费用），用户会对资产通给予全额补偿并使之不受损害。</View>
        <View className='hh'>七．服务中断或故障</View>
        <View className='indent mt'>7.1 用户同意，基于互联网的特殊性，资产通不担保服务不会中断，也不担保服务的及时性和/或安全性。系统因有关状况无法正常运作，使用户无法使用任何资产通服务或使用资产通服务受到任何影响时，资产通对用户或第三方不负任何责任，前述状况包括但不限于： （1）资产通、银行支付系统系统停机维护期间。 （2）电信设备出现故障不能进行数据传输的。 （3）由于黑客攻击、网络供应商技术调整或故障、平台升级、银行方面的问题等原因而造成的资产通服务中断或延迟。 （4）因台风、地震、海啸、洪水、停电、战争、恐怖袭击等不可抗力之因素，造成资产通系统障碍不能执行业务的。</View>
        <View className='hh'>八、隐私保护及授权条款</View>
        <View className='indent mt'>8.1 资产通对于用户提供的、资产通自行收集的、经认证的身份信息将按照本协议予以保护、使用或者披露。未经资产通事先书面同意，用户不得转让其在本协议项下的任何权利和义务。</View>
        <View className='indent mt'>8.2 为了维护用户和资产通其他用户的利益，用户同意授权资产通及其代理机构、建立业务合作关系的机构等，以便核对用户的注册信息等。</View>
        <View className='indent mt'>8.3 资产通按照用户在平台上的行为自动追踪关于用户的某些资料。在不违法透露用户的隐私资料的前提下，资产通有权对整个用户数据库进行分析并对用户数据库进行商业上的利用。</View>
        <View className='indent mt'>8.4 用户同意资产通可使用用户的相关资料（包括但不限于资产通持有的用户档案中的资料，资产通从用户目前及以前在资产通平台上的活动所获取的其他资料，以及资产通通过其他方式自行收集的资料）以解决争议、对纠纷进行调停。用户同意资产通可通过人工或自动程序对用户资料进行评价。</View>
        <View className='indent mt'>8.5 资产通采用行业标准惯例以保护用户的资料。用户因履行本协议提供给资产通的信息，资产通不会恶意出售或共享给任何第三方，以下情况除外： （1）提供独立服务且仅要求服务相关的必要信息的供应商，如印刷厂、邮递公司等。 （2）具有合法调阅信息权限并从合法渠道调阅信息的政府部门或其他机构，如公安机关、法院。 （3）资产通的关联方，比如银行。 （4）协调处理与平台上用户之间交易相关的争议。</View>
        <View className='indent mt'>8.6 资产通有义务根据有关法律要求向司法机关和政府部门提供用户的资料。在用户未能按照与资产通签订的服务协议或者与平台其他用户签订的协议等法律文本的约定履行自己应尽的义务时，资产通有权根据自己的判断，或者与该笔交易有关的其他用户的请求披露用户的信息资料，并做出评论。用户严重违反资产通相关规则的，资产通有权对用户提供的及资产通自行收集的用户信息和资料编辑入平台黑名单，并将该黑名单对第三方披露，且资产通有权将用户提交或资产通自行收集的用户资料和信息与任何第三方进行数据共享，由此可能造成的用户的任何损失，资产通不承担法律责任。</View>
        <View className='hh'>九、知识产权</View>
        <View className='indent mt'>9.1资产通拥有平台内所有信息内容，包括但不限于文字、图片、软件、音频、视频等的版权。非经资产通书面同意，任何组织或个人都不得复制、打印和传播属于资产通平台的信息内容用于其他目的。平台所有的产品、技术及程序均属于资产通知识产权，未经资产通许可，任何人不得擅自使用（包括但不限于以非法的方式复制、传播、展示、下载等）。否则，资产通依法追究其法律责任。</View>
        <View className='hh'>十、服务条款的完善和修改</View>
        <View className='indent mt'>10.1 资产通有权根据互联网的发展和中华人民共和国有关法律、法规的变化，不时地完善和修改资产通服务条款。</View>
        <View className='indent mt'>10.2 资产通保留随时修改服务条款的权利，用户在使用资产通平台服务时，有必要对最新的资产通服务条款进行仔细阅读和重新确认，当发生有关争议时，请以最新的服务条款为准。</View>
        <View className='hh'>十一、特别约定</View>
        <View className='indent mt'>11.1 本协议是由用户与资产通双方签订的，适用于用户在资产通的全部活动。本协议内容包括但不限于协议正文条款及已经发布的或将来可能发布的各类规则，所有条款和规则为协议不可分割的一部分，与协议正文具有同等法律效力。</View>
        <View className='indent mt'>11.2 本协议不涉及用户与资产通的其他用户之间，因网上交易而产生的法律关系及法律纠纷，但用户在此同意将全面接受并履行与资产通其他用户在平台签订的任何电子法律文本，并承诺按照该法律文本享有和（或）放弃相应的权利、承担和（或）豁免相应的义务。</View>
        <View className='indent mt'>11.3 因本协议之效力、解释、变更、执行与争议解决均适用中华人民共和国法律。如无相关法律规定，可参照商业惯例和（或）行业习惯。</View>
        <View className='indent mt'>11.4 因本协议产生的争议，应当协商解决，协商不成时，任何一方均可向资产通所在地的人民法院提起诉讼。 本协议最后更新版本：2019年11月29日</View>
      </View>

    </View>
  )
}
